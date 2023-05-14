/* eslint-disable no-restricted-syntax */
import getShopId from './pipeline/getShopId.js';
import logger from '../../config/log.js';

const SHOPE_NAMES = [
	'coolmate.vn',
];

const main = async () => {
	logger.info('Step 01: Start getting shop info');
	const shopInfo = [];
	for (const shopName of SHOPE_NAMES) {
		const shopId = await getShopId(shopName);
		shopInfo.push({
			shopName,
			shopId,
		});
	}

	logger.info('Step 02: Downloading shop product data');
	console.log(shopInfo);
};

main();
