import fs from 'fs';

import logger from '../../config/log.js';
import getAllProductLink from './pipeline/getAllProductLink.js';
import {
	CONTINUE,
} from '../../config/parram.js';

export default async function extractShopeeByShop(shopId, driverArr) {
	let allLink = [];
	if (!CONTINUE) {
		logger.info(`Step 01: getAllProductLink: ${shopId}`);
		allLink = await getAllProductLink(shopId, driverArr[0]);

		// save to cache file
		const cacheFilePath = `./cache/shopee-${shopId}-allLink.json`;
		fs.writeFileSync(cacheFilePath, JSON.stringify(allLink));
	} else {
		logger.info(`Step 01: Load all product link from cache: ${shopId}`);
		// read from cache file if exist
		const cacheFilePath = `./cache/shopee-${shopId}-allLink.json`;
		if (fs.existsSync(cacheFilePath)) {
			allLink = JSON.parse(fs.readFileSync(cacheFilePath));
		}
	}

	logger.info(`Step 02: getAllProductInfo: ${shopId}`);
}
