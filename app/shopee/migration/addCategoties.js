/* eslint-disable no-restricted-syntax */
import '../../../config/mongoose.js';

import axios from 'axios';

import Products from '../../../models/Products.js';
import logger from '../../../config/log.js';

const MAX_CHUNK = 100;

const fetchProductData = async (id, url) => {
	const [shopId, itemId] = url.split('-i.')[1].split('.');
	const URL_ENDPOINT = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

	const { data } = await axios.get(URL_ENDPOINT);

	const {
		description,
		categories,
	} = data.item;

	// remove first category
	categories.shift();

	await Products.updateProductById(id, {
		description,
		category: categories.map((category) => category.display_name),
	});
	logger.info(`Updated product ${id} with ${categories.map((category) => category.display_name).join(', ')}`);
};

const mainMigration = async () => {
	const allShopeeProducts = (await Products.getAllProductByDomain('shopee.vn'))
		.map((product) => ({
			_id: product._id,
			url: product.url,
		}));

	// split to sub array with MAX_CHUNK
	const allShopeeProductsChunks = [];
	for (let i = 0; i < allShopeeProducts.length; i += MAX_CHUNK) {
		allShopeeProductsChunks.push(allShopeeProducts.slice(i, i + MAX_CHUNK));
	}

	for (const chunk of allShopeeProductsChunks) {
		await Promise.all(chunk.map(({ _id, url }) => fetchProductData(_id, url)));
	}
};

mainMigration();
