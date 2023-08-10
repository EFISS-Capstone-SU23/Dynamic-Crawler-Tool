import fs from 'fs';

import '../../config/env.js';
import '../../config/mongoose.js';
import getShopData from './pipeline/getShopData.js';

const DATA_PATH = './app/shopee/data/shopList_output.json';
const CHECKED_URL_PATH = './cache/shopeeCheckedURL.json';

const main = async () => {
	const currentShopName = 'FACIOSHOP.COM';

	let shopInfo = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

	let checkedURL = {};
	if (fs.existsSync(CHECKED_URL_PATH)) {
		checkedURL = JSON.parse(fs.readFileSync(CHECKED_URL_PATH, 'utf8'));
	}

	if (currentShopName) {
		// get all shop after currentShopName and currentShopName
		const currentShopIndex = shopInfo.findIndex((shop) => shop.shopName === currentShopName);
		console.log('currentShopIndex', currentShopIndex);
		shopInfo = shopInfo.slice(currentShopIndex);
	}
	console.log('shopInfo', shopInfo.length);

	for (const shop of shopInfo) {
		const shopName = `shopee-${shop.shopName}`;
		await getShopData(parseInt(shop.shopId, 10), shopName, checkedURL);
	}
};

main();
