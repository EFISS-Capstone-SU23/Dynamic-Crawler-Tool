/* eslint-disable no-unused-vars */
import axios from 'axios';
import fs from 'fs';

import { saveFileFromURL } from '../../../utils/file/saveFileFromURL.js';
import logger from '../../../config/log.js';
import { delay } from '../../../utils/delay.js';
import { STORAGE_PREFIX } from '../../../config/config.js';
import { bucketName } from '../../storage/setupStorage.js';
import Products from '../../../models/Products.js';

const PAGE_SIZE = 100;
const MAX_RETRY = 5;
const CHECKED_SHOP_ID_PATH = './cache/shopeeCheckedShopId.json';
const COOKIE_FOLDER = './app/shopee/config/shopeeCookie/';

const keywords = [
	'áo',
	'quần',
	'váy',
	'đầm',
	// 'giày',
];

// read all file cookie in COOKIE_FOLDER and push into array
const cookieFiles = fs.readdirSync(COOKIE_FOLDER);
const cookies = cookieFiles.map((cookieFile) => fs.readFileSync(`${COOKIE_FOLDER}/${cookieFile}`, 'utf8'));
let currentCookieIndex = 0;

const downloadImage = async (product, shopName, images) => {
	const imagesPromise = images.map(async (imageLink, i) => {
		const imgPath = `${STORAGE_PREFIX}/${shopName}/${product._id}_${i}_${shopName.replace(/[^a-zA-Z0-9]/g, '_')}.jpeg`;

		const saveStatus = await saveFileFromURL(imageLink, imgPath, logger);

		if (!saveStatus) {
			return null;
		}

		return `https://storage.googleapis.com/${bucketName}/${imgPath}`;
	});
	const imageLinks = await Promise.all(imagesPromise);
	const imageLinksFiltered = imageLinks.filter((imageLink) => imageLink !== null);
	return imageLinksFiltered;
};

const requestGetWithCookie = async (url) => {
	try {
		// read current cookie
		console.log('currentCookieIndex', currentCookieIndex);
		const currentCookie = cookies[currentCookieIndex];

		// update currentCookieIndex
		currentCookieIndex = (currentCookieIndex + 1) % cookies.length;
		const res = await axios.get(url, {
			headers: {
				cookie: currentCookie.trim(),
				'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
			},
		});

		return res.data;
	} catch (error) {
		console.log('error', error.message);
		console.log(url);

		return null;
	}
};

const getItem = async (API_ENDPOINT, shopName, num) => {
	const res = await requestGetWithCookie(API_ENDPOINT);
	if (!res) {
		return null;
	}

	const data = res.data || {};
	const items = data.items;

	if (!items) {
		logger.info(`There are error when getting items of shop ${shopName}`);

		if (num < MAX_RETRY) {
			await delay(5 * 60 * 1000);
			logger.info(`Retry ${num + 1} for shop ${shopName}`);
			return getItem(API_ENDPOINT, shopName, num + 1);
		}
		return null;
	}

	return items;
};

export default async function getShopData(shopId, shopName, checkedShopId = {}) {
	// check if shopId is checked
	if (checkedShopId[shopId]) {
		return;
	}

	logger.info(`Downloading shop ${shopName} - ${shopId}`);
	let offSet = 0;

	const downloadedURL = await Products.getDownloadedProductURLByShopName(shopName);

	while (true) {
		logger.info(`Downloading page ${offSet / PAGE_SIZE + 1} of shop ${shopName}`);
		const API_ENDPOINT = `https://shopee.vn/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&limit=${PAGE_SIZE}&offset=${offSet}&shop_id=${shopId}&sort_type=1&upstream=search`;

		const res = await requestGetWithCookie(API_ENDPOINT);
		if (!res) {
			break;
		}

		const data = res.data || {};
		const items = await getItem(API_ENDPOINT, shopName, 1);

		if (!items) {
			throw new Error('There are error when downloading shop');
		}

		for (const item of items) {
			const {
				name,
				itemid,
				price,
			} = item;

			// check if name contains keyword
			const nameWords = name.toLowerCase().split(' ');
			if (!keywords.some((keyword) => nameWords.includes(keyword))) {
				continue;
			}

			let {
				images,
			} = item;
			images = images.map((image) => `https://down-vn.img.susercontent.com/file/${image}`);

			const url = `https://shopee.vn/product/${shopId}/${itemid}`;

			if (downloadedURL[url]) {
				continue;
			}

			logger.info(`Downloading item ${name}`);

			const product = await Products.insertNewProduct({
				title: name,
				price: price / 1e5,
				originalImages: images,
				description: name,
				url,
				shopName,
				metadata: {},
				active: true,
			});

			// download image in imageLinks
			const imageLinks = await downloadImage(product, shopName, images);

			if (!imageLinks) {
				logger.error(`Timeout download image for item ${name}`);
				logger.error(shopId, itemid);

				// remove product
				await Products.deleteProductById(product._id);
				continue;
			}

			// save product image path to database
			await Products.updateProductById(product._id, {
				images: imageLinks,
				activeImageMap: imageLinks.map(() => true),
			});
		}

		if (data.no_more) {
			logger.info(`No more data for shop ${shopName}`);
			break;
		}

		offSet += PAGE_SIZE;
	}

	// save checkedShopId
	checkedShopId[shopId] = true;

	fs.writeFileSync(CHECKED_SHOP_ID_PATH, JSON.stringify(checkedShopId, null, 4));
}
