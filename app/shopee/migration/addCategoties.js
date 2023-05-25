/* eslint-disable no-restricted-syntax */
import '../../../config/env.js';
import '../../../config/mongoose.js';

import axios from 'axios';
import fs from 'fs';

import Products from '../../../models/Products.js';
import logger from '../../../config/log.js';

const USER_FOLDER = './app/shopee/config/shopeeUser/';

// eslint-disable-next-line no-unused-vars
const fetchProductData = async (id, url, header) => {
	const [shopId, itemId] = url.split('-i.')[1].split('.');
	try {
		const URL_ENDPOINT = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

		const {
			data,
		} = await axios.get(URL_ENDPOINT, {
			headers: header,
		});

		if (!data.data) {
			logger.error(`Cannot get product ${id} with url shoppid=${shopId} and itemid=${itemId}`);
			return;
		}

		const {
			description,
			categories,
			images,
		} = data.data;

		// remove first category
		// categories.shift();

		await Products.updateProductById(id, {
			description,
			category: categories.map((category) => category.display_name),
			original_images: images.map((image) => `https://down-vn.img.susercontent.com/file/${image}`),
		});
		logger.info(`Updated product ${id} with ${categories.map((category) => category.display_name).join(', ')}`);
	} catch (error) {
		logger.error(`Cannot get product ${id} with shopid=${shopId} and itemid=${itemId}`);
	}
};

const processForEachUser = (userHeader, products) => {
	const { NAME } = userHeader;

	while (true) {
		if (!products) {
			logger.info(`${NAME} has no product => Stop!`);
			return null;
		}
	}
};

const mainMigration = async () => {
	const allShopeeProducts = (await Products.getAllProductByDomain('shopee.vn'))
		.filter((product) => !product.categories || !product.description)
		.map((product) => ({
			_id: product._id,
			url: product.url,
		}));

	// split to sub array with MAX_CHUNK
	// const allShopeeProductsChunks = [];
	// for (let i = 0; i < allShopeeProducts.length; i += MAX_CHUNK) {
	// 	allShopeeProductsChunks.push(allShopeeProducts.slice(i, i + MAX_CHUNK));
	// }

	// for (const chunk of allShopeeProductsChunks) {
	// 	await Promise.all(chunk.map(({
	// 		_id,
	// 		url,
	// 	}) => fetchProductData(_id, url)));
	// 	await delay(3 * 1000);
	// }

	// Read all file in user folder
	const users = [];
	fs.readdirSync(USER_FOLDER).forEach((file) => {
		const pathFile = `${USER_FOLDER}/${file}`;
		const user = JSON.parse(fs.readFileSync(pathFile));
		user.pathFile = pathFile;

		users.push(user);
	});

	const userProcessPromises = users.map(async (user) => {
		processForEachUser(user, allShopeeProducts);
	});

	await Promise.all(userProcessPromises);
};

mainMigration();
