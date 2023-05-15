/* eslint-disable no-restricted-syntax */
import '../../config/mongoose.js';

import getShopId from './pipeline/getShopId.js';
import getShopData from './pipeline/getShopData.js';
import logger from '../../config/log.js';
import fetchAllShop from './pipeline/fetchAllShop.js';
import {
	FETCH_ALL,
} from '../../config/parram.js';

const SHOPE_NAMES = [
	'tinn_store',
	'22decembrestore',
	'thedelia',
	'rame_vn',
	'poloman.vn',
	'coolmate.vn',
];

const main = async () => {
	logger.info('Step 01: Start getting shop info');
	let shopInfo = [];
	if (!FETCH_ALL) {
		for (const shopName of SHOPE_NAMES) {
			const shopId = await getShopId(shopName);

			if (!shopId) {
				logger.error(`Cannot find shopId for ${shopName}`);
				continue;
			}

			shopInfo.push({
				shopName,
				shopId,
			});
		}
	} else {
		logger.info('Fetching all shop info');
		shopInfo = await fetchAllShop();
		logger.info(`Fetched ${shopInfo.length} shops`);
	}

	logger.info('Step 02: Downloading shop product data');
	for (const shop of shopInfo) {
		const group = `shopee-${shop.shopName}`;
		await getShopData(shop.shopId, group);
	}
};

main();
