/* eslint-disable no-restricted-syntax */
import '../../config/env.js';
import getDriverArray from '../../utils/getDriverArray.js';
import {
	MAX_INSTANCE,
} from '../../config/parram.js';
import extractShopeeByShop from './extractShopeeByShop.js';

const SHOP_IDS = [
	'coolmate.vn',
];

const driverArr = getDriverArray(MAX_INSTANCE);
try {
	for (const shopId of SHOP_IDS) {
		await extractShopeeByShop(shopId, driverArr);
	}
} finally {
	driverArr.forEach((driver) => {
		driver.quit();
	});
}
