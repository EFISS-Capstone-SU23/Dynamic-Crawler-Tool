/* eslint-disable no-restricted-syntax */
import '../../config/env.js';
import getDriverArray from '../../utils/getDriverArray.js';
import {
	MAX_INSTANCE,
} from '../../config/parram.js';
// import extractShopeeByShop from './extractShopeeByShop.js';
import loginShopee from './utils/loginShopee.js';

// const SHOP_IDS = [
// 	'coolmate.vn',
// ];

const driverArr = getDriverArray(MAX_INSTANCE);
const main = async () => {
	// Login to shopee for all driver
	for (const driver of driverArr) {
		await loginShopee(driver);
	}

	// for (const shopId of SHOP_IDS) {
	// 	await extractShopeeByShop(shopId, driverArr);
	// }
};

main().catch((error) => {
	console.error(error);
	driverArr.forEach((driver) => {
		driver.quit();
	});
}).then(() => {
	// driverArr.forEach((driver) => {
	// 	driver.quit();
	// });
});
