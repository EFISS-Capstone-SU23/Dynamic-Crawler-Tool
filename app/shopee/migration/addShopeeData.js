/* eslint-disable no-restricted-syntax */
import '../../../config/env.js';
import '../../../config/mongoose.js';

import axios from 'axios';
import fs from 'fs';

import Products from '../../../models/Products.js';
import logger from '../../../config/log.js';
import { delay } from '../../../utils/delay.js';
import productAPI from '../../../api/productAPI.js';

const USER_FOLDER = './app/shopee/config/shopeeUser/';
const BASE_HEADER = {
	'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
};

const getCookieKey = (cookies) => {
	const cookieKey = {};
	for (const cookie of cookies) {
		const [key, value] = cookie.split(';')[0].split('=');
		cookieKey[key] = value;
	}

	return cookieKey.SPC_EC;
};

const fetchProductData = async (id, url, header) => {
	const [shopId, itemId] = url.split('-i.')[1].split('.');
	try {
		const URL_ENDPOINT = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

		const response = await axios.get(URL_ENDPOINT, {
			headers: header,
		});

		const { data } = response;
		if (!data.data) {
			logger.error(`Cannot get product ${id} with url shoppid=${shopId} and itemid=${itemId}`);
			return;
		}

		const {
			description,
			categories,
			images,
			price,
		} = data.data;

		// remove first category
		// categories.shift();

		await productAPI.updateProductById(id, {
			description,
			categories: categories.map((category) => category.display_name),
			originalImages: images.map((image) => `https://down-vn.img.susercontent.com/file/${image}`),
			price: price / 1e5,
			url: `https://shopee.vn/product/${shopId}/${itemId}`,
		});
		logger.info(`Updated product ${id} with ${categories.map((category) => category.display_name).join(', ')}`);

		await delay(2 * 1000);
		return getCookieKey(response.headers['set-cookie']);
	} catch (error) {
		logger.error(`Cannot get product ${id} with shopid=${shopId} and itemid=${itemId}`);

		await delay(2 * 1000);
		return null;
	}
};

const processForEachUser = async (userHeader, products) => {
	const { NAME, BASE_COOKIE, pathFile } = userHeader;
	delete userHeader.pathFile;
	let SPC_EC = userHeader.SPC_EC;

	while (true) {
		if (!products.length) {
			logger.info(`${NAME} has no product => Stop!`);
			return null;
		}

		const product = products.shift();
		const header = {
			...BASE_HEADER,
			'Af-Ac-Enc-Dat': userHeader['Af-Ac-Enc-Dat'],
			Cookie: `${BASE_COOKIE}; SPC_EC=${SPC_EC}`,
		};

		const NEW_SPC_EC = await fetchProductData(product._id, product.url, header);
		SPC_EC = NEW_SPC_EC || SPC_EC;
		userHeader.SPC_EC = SPC_EC;

		// Save user header to file
		fs.writeFileSync(pathFile, JSON.stringify(userHeader, null, 4));
	}
};

const mainMigration = async () => {
	const allShopeeProducts = (await Products.getAllProductByDomain('shopee.vn'))
		.filter((product) => (product.categories || []).length === 0)
		.map((product) => ({
			_id: product._id,
			url: product.url,
		}));

	logger.info(`Total product need to update: ${allShopeeProducts.length}`);

	// Read all file in user folder
	const users = [];
	fs.readdirSync(USER_FOLDER).forEach((file) => {
		const pathFile = `${USER_FOLDER}/${file}`;
		const user = JSON.parse(fs.readFileSync(pathFile));
		user.pathFile = pathFile;

		users.push(user);
	});

	const userProcessPromises = users.map(async (user) => {
		await processForEachUser(user, allShopeeProducts);
	});

	await Promise.all(userProcessPromises);
	logger.info('Done!');
};

mainMigration();
