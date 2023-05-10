import fs from 'fs';

import logger from '../../config/log.js';
import getAllProductLink from './pipeline/getAllProductLink.js';

export default async function extractShopeeByShop(shopId, driverArr) {
	logger.info(`Step 01: getAllProductLink: ${shopId}`);
	const allLink = await getAllProductLink(shopId, driverArr[0]);

	// save to cache file
	const cacheFilePath = `./cache/shopee-${shopId}-allLink.json`;
	fs.writeFileSync(cacheFilePath, JSON.stringify(allLink));

	logger.info(`Step 02: getAllProductInfo: ${shopId}`);
}
