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
const userCookiePath = './app/shopee/config/userCookie.txt';
const CHECKED_URL_PATH = './cache/shopeeCheckedURL.json';

let currentCookie = null;

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
		const res = await axios.get(url, {
			headers: {
				cookie: currentCookie.trim(),
				'af-ac-enc-dat': 'AAcyLjkuMi0yAAABid5CcokAAA/NAxAAAAAAAAAAAj+vsCNYRQtlBEi9eHhIEncfIYqwkRT9yzQU9sT5G90SZdx22Ya2dN5jgu9PvDoU8lIX8VhkcacgL2kemMBHRH70aNAIOdwCep1Q99EpbW5p/Pvn2Ofdpi66i51H4EG+R9nePyqD6E5H4klmr0mTwJtTNt6j1OcCNS7M1dm/lCnSfv2Pbnr5Ughh0u74tGQZkUDYJ3DlYCPQjA6+JS/Z1S6N32r6DPD+YpKckfaCaXgjkPJiHzHsLg/KKuX5ngnrB2gh0smlS+EncvH6CraI/hIzscJ+Z1CJe14X+eXYi7H5ZO78qPd8M/kL3w94mn2sVcZIcDcuKUDJBRsxf6AXjZCmcJ2GtMuVi2/+Dve5XjZC8M1ZPlJhFKOj4NfzJri3sTlWb2OX+yIurpSBgrqEApRZVYT8l/82EyfDx/bVRcPaaRvYmydPsqW/05OwE2UYZML3BRfBtfb6hsFnQW3si1z+nDRansmpFtCLio4F9fmX30otNIRBl7L03VQeYWa4u8Xo8KzoTSYUoZmmcTW5TFjhYuOTLvIRZyZ1lLkuxgMzcDHyX3a3azzTZpfW/Jao/lfEuW7oTSYUoZmmcTW5TFjhYuOTLvIRZyZ1lLkuxgMzcDHyX7TX0ab1QwRWuaZ4JlUere92+vHZwM0CH9aJrMyByAHYilagjeXO+g8oPH3pZVAHEZZ94d5r0czHgMSp10LFt9cLuOZYNwUIyv4ZirUTkvn6ilagjeXO+g8oPH3pZVAHEV/548WqHdvxxp3cepiCWtwLjIzUb5NevfxOTk7pZUYS4uCgisFY7om8kJPXrmzIjvCOA8DPNz601jFsfIZVQIQveqjOsnqLHoXuCvALGBBul/82EyfDx/bVRcPaaRvYm5f/NhMnw8f21UXD2mkb2Jt9GM/RITWcCp6ZKbfRn5Ss/d36QXZdPXw6a2855idAWXNdBn/e1csioJgvqaNQvtgV/ZVdtQE16+YjjrCqknpqMJJmwsnU0WQGAv4Bj2fY4JBJM185VJop2ase7oss/H+HQaC6rpU/rbmBUNItKZki',
				'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
			},
		});

		// update cookie for next request
		const setCookieHeader = res.headers['set-cookie'];
		if (setCookieHeader) {
			const cookies = setCookieHeader.map(cookie.parse);

			// console.log(cookies);
			const serializedCookies = cookies
				.map((c) => {
					// get first poperty of cookie
					const key = Object.keys(c)[0];
					return `${key}=${c[key]}`;
				}).join('; ');

			currentCookie = serializedCookies;
			fs.writeFileSync(userCookiePath, serializedCookies);
		}

		return res.data;
	} catch (error) {
		console.log('error', error.response);
		console.log(url);

		return null;
	}
};

export default async function getShopData(shopId, shopName, checkedURL = {}) {
	logger.info(`Downloading shop ${shopName} - ${shopId}`);
	let offSet = 0;

	const downloadedURL = await Products.getDownloadedProductURLByShopName(shopName);

	while (true) {
		logger.info(`Downloading page ${offSet / PAGE_SIZE + 1} of shop ${shopName}`);
		const API_ENDPOINT = `https://shopee.vn/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&limit=${PAGE_SIZE}&offset=${offSet}&shop_id=${shopId}`;

		// get cookie
		if (!currentCookie) {
			// in first time, read cookie from file
			currentCookie = fs.readFileSync(userCookiePath, 'utf8');
		}

		const res = await requestGetWithCookie(API_ENDPOINT);
		// update cookie for next request
		// const setCookieHeader = res.headers['set-cookie'];
		// if (setCookieHeader) {
		// 	const cookies = setCookieHeader.map(cookie.parse);

		// 	console.log(Object.entries(cookies));
		// 	const serializedCookies = Object.entries(cookies)
		// 		.map(([key, value]) => `${key}=${value}`)
		// 		.join('; ');

		// 	currentCookie = serializedCookies;
		// 	fs.writeFileSync(userCookiePath, serializedCookies);
		// }

		if (!res) {
			continue;
		}

		const data = res.data;
		if (!data || !(data.items || []).length) {
			logger.info(`No more data for shop ${shopName}`);
			break;
		}
		const items = data.items;

		for (const item of items) {
			const {
				name,
				itemid,
				price,
			} = item;

			let {
				images,
			} = item;
			images = images.map((image) => `https://down-vn.img.susercontent.com/file/${image}`);

			const url = `https://shopee.vn/product/${shopId}/${itemid}`;

			if (checkedURL[url]) {
				continue;
			}

			checkedURL[url] = true;

			if (downloadedURL[url]) {
				continue;
			}

			// const product = await productAPI.insertNewProduct({
			// 	title: name,
			// 	price: price / 1e5,
			// 	originalImages: images,
			// 	description,
			// 	url,
			// 	shopName,
			// 	metadata: {},
			// });

			// fetch item data
			const URL_ENDPOINT = `https://shopee.vn/api/v4/item/get?itemid=${itemid}&shopid=${shopId}`;

			// random sleep from 1.0 top 2.0s
			// const time = Math.random() * (2.0 - 1.0) + 1.0;

			const productRes = await requestGetWithCookie(URL_ENDPOINT);
			await delay(2.5 * 1000);

			if (!productRes) {
				logger.error(`Cannot get product data for item ${name}`);
				logger.error(shopId, itemid);

				continue;
			}

			const productData = productRes.data;

			if (!productData) {
				logger.error(`Cannot get product data for item ${name}`);
				logger.error(shopId, itemid);

				continue;
			}

			const {
				categories,
				description,
			} = productData;
			const categoriesName = categories.map((category) => category.display_name);

			// check if category is fashion
			if (!categoriesName.some((categoryName) => FASHION_CATEGORY.some((fashionCategory) => categoryName.includes(fashionCategory)))) {
				// logger.info(`Skip item ${name} because it is not fashion`);
				continue;
			}
			logger.info(`Downloading item ${name}`);

			const product = await Products.insertNewProduct({
				title: name,
				price: price / 1e5,
				originalImages: images,
				description,
				url,
				shopName,
				metadata: {},
				active: true,
				categories: categoriesName,
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
		offSet += PAGE_SIZE;

		// save checkedURL
		fs.writeFileSync(CHECKED_URL_PATH, JSON.stringify(checkedURL, null, 4));
	}
}
