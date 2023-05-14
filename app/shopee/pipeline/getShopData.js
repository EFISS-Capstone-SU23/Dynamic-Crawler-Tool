/* eslint-disable no-loop-func */
import axios from 'axios';

import Products from '../../../models/Products.js';
import { saveFileFromURL } from '../../../utils/file/saveFileFromURL.js';
import logger from '../../../config/log.js';

const PAGE_SIZE = 15;

export default async function getShopData(shopId, group) {
	logger.info(`Downloading shop ${group}`);
	let offSet = 0;

	while (true) {
		logger.info(`Downloading page ${offSet / PAGE_SIZE + 1} of shop ${group}`);
		const API_ENDPOINT = `https://shopee.vn/api/v4/shop/rcmd_items?bundle=shop_page_category_tab_main&limit=${100}&offset=${offSet}&shop_id=${shopId}`;

		const res = await axios.get(API_ENDPOINT);
		const data = res.data.data;

		if (!data || data.no_more) {
			logger.info(`No more data for shop ${group}`);
			break;
		}
		const items = data.items;

		// Download all items in this page
		const itemsPromises = items.map(async (item) => {
			const {
				name,
				images,
				itemid,
				price,
			} = item;
			const url = `https://shopee.vn/${name}-i.${shopId}.${itemid}`;
			const description = name;

			logger.info(`Downloading item ${name}`);
			const product = await Products.insertNewProduct({
				title: name,
				price,
				description,
				url,
				group,
				metadata: {},
			});

			// download image in imageLinks
			const imageLinks = [];
			images.forEach(async (image, i) => {
				const imageLink = `https://down-vn.img.susercontent.com/file/${image}`;
				const imgPath = `./output/${group}/${product._id}_${i}_${group.replace(/[^a-zA-Z0-9]/g, '_')}.jpeg`;

				const saveStatus = await saveFileFromURL(imageLink, imgPath);

				if (!saveStatus) {
					return;
				}

				imageLinks.push(imgPath);
			});

			// save product image path to database
			await Products.updateProductById(product._id, {
				images: imageLinks,
			});
		});

		await Promise.all(itemsPromises);

		offSet += PAGE_SIZE;
	}
}
