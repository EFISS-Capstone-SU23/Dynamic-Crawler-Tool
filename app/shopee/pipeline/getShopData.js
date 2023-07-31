/* eslint-disable no-continue */
/* eslint-disable no-restricted-syntax */
/* eslint-disable no-loop-func */
import axios from 'axios';

import { saveFileFromURL } from '../../../utils/file/saveFileFromURL.js';
import logger from '../../../config/log.js';
import { delay } from '../../../utils/delay.js';
import { STORAGE_PREFIX } from '../../../config/config.js';
import { bucketName } from '../../storage/setupStorage.js';
import productAPI from '../../../api/productAPI.js';

const PAGE_SIZE = 100;
const MAX_DOWNLOAD_IMAGE = 30 * 1000;

const timeoutDownloadImage = new Promise((resolve) => {
	setTimeout(() => {
		resolve();
	}, MAX_DOWNLOAD_IMAGE);
});

const downloadImage = async (product, group, images) => {
	const imagesPromise = images.map(async (imageLink, i) => {
		const imgPath = `${STORAGE_PREFIX}/${group}/${product._id}_${i}_${group.replace(/[^a-zA-Z0-9]/g, '_')}.jpeg`;

		const saveStatus = await saveFileFromURL(imageLink, imgPath);

		if (!saveStatus) {
			return null;
		}

		return `https://storage.googleapis.com/${bucketName}/${imgPath}`;
	});
	const imageLinks = await Promise.all(imagesPromise);
	const imageLinksFiltered = imageLinks.filter((imageLink) => imageLink !== null);
	return imageLinksFiltered;
};

export default async function getShopData(shopId, group) {
	logger.info(`Downloading shop ${group} - ${shopId}`);
	let offSet = 0;

	const downloadedURL = await productAPI.getDownloadedProductURL('shopee.vn');

	while (true) {
		logger.info(`Downloading page ${offSet / PAGE_SIZE + 1} of shop ${group}`);
		const API_ENDPOINT = `https://shopee.vn/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&limit=${100}&offset=${offSet}&shop_id=${shopId}`;

		const res = await axios.get(API_ENDPOINT);
		const data = res.data.data;

		if (!data || !(data.items || []).length) {
			logger.info(`No more data for shop ${group}`);
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
			const description = name;

			if (downloadedURL[url]) {
				continue;
			}

			logger.info(`Downloading item ${name}`);
			const product = await productAPI.insertNewProduct({
				title: name,
				price: price / 1e5,
				originalImages: images,
				description,
				url,
				group,
				metadata: {},
			});

			// download image in imageLinks
			// filter null\
			const imageLinks = await Promise.race([
				downloadImage(product, group, images),
				timeoutDownloadImage,
			]);

			if (!imageLinks) {
				logger.error(`Timeout download image for item ${name}`);
				logger.error(shopId, itemid);
				continue;
			}

			// save product image path to database
			await productAPI.updateProductById(product._id, {
				images: imageLinks,
			});
			await delay(0.2 * 1000);
		}

		offSet += PAGE_SIZE;
	}
}
