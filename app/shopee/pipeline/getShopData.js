/* eslint-disable no-unused-vars */
/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
import axios from 'axios';
import fs from 'fs';
import cookie from 'cookie';

import { saveFileFromURL } from '../../../utils/file/saveFileFromURL.js';
import logger from '../../../config/log.js';
import { delay } from '../../../utils/delay.js';
import { STORAGE_PREFIX } from '../../../config/config.js';
import { bucketName } from '../../storage/setupStorage.js';
// import productAPI from '../../../api/productAPI.js';
import Products from '../../../models/Products.js';

const PAGE_SIZE = 100;
const MAX_DOWNLOAD_IMAGE = 	10 * 60 * 1000;
const DAT_PATH = './app/shopee/config/af-ac-enc-dat.txt';
const CHECKED_SHOP_ID_PATH = './cache/shopeeCheckedShopId.json';

// const userCookiePath = './app/shopee/config/userCookie.json';
const userCookiePath = './app/shopee/config/userCookie.txt';

const currentCookie = fs.readFileSync(userCookiePath, 'utf8');
const currentDat = fs.readFileSync(DAT_PATH, 'utf8').trim();

const timeoutDownloadImage = new Promise((resolve) => {
	setTimeout(() => {
		resolve();
	}, MAX_DOWNLOAD_IMAGE);
});

const FASHION_CATEGORY = [
	'Thời Trang Nam',
	'Thời Trang Nữ',
	'Thời Trang Trẻ em',
];

const keywords = [
	'áo',
	'quần',
	'váy',
	'đầm',
	// 'giày',
];

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
	const cookieToString = (cookieObj) => Object.entries(cookieObj).map(([key, value]) => `${key}=${value}`).join('; ');

	try {
		const res = await axios.get(url, {
			headers: {
				cookie: currentCookie.trim(),
				'af-ac-enc-dat': currentDat,
				'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
			},
		});

		// update cookie for next request
		// const setCookieHeader = res.headers['set-cookie'];
		// if (setCookieHeader) {
		// 	const cookies = setCookieHeader.map(cookie.parse);
		// 	cookies
		// 		.forEach((c) => {
		// 			// get first poperty of cookie
		// 			const key = Object.keys(c)[0];
		// 			// console.log(key, c[key]);
		// 			currentCookie[key] = c[key];
		// 		});

		// 	//  save cookie to file json
		// 	fs.writeFileSync(userCookiePath, JSON.stringify(currentCookie, null, 4));
		// }

		return res.data;
	} catch (error) {
		console.log('error', error.message);
		console.log(url);

		return null;
	}
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
		const items = data.items;

		if (!items) {
			logger.info(`There are error when downloading shop ${shopName} - ${shopId}`);
			throw new Error('There are error when downloading shop');
		}

		for (const item of items) {
			const {
				name,
				itemid,
				price,
			} = item;

			// check if name contains keyword
			if (!keywords.some((keyword) => name.toLowerCase().includes(keyword))) {
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
			// filter null\
			// const imageLinks = await Promise.race([
			// 	downloadImage(product, shopName, images),
			// 	timeoutDownloadImage,
			// ]);
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

		// sleep 30s
		// await delay(10 * 1000);

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
