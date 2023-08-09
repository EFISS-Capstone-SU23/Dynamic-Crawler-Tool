import fs from 'fs';

import '../../config/env.js';
import '../../config/mongoose.js';
import getShopData from './pipeline/getShopData.js';

const DATA_PATH = './app/shopee/data/shopList_output.json';

const main = async () => {
	const shopInfo = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
	console.log('shopInfo', shopInfo.length);

	for (const shop of shopInfo) {
		const shopName = `shopee-${shop.shopName}`;
		await getShopData(parseInt(shop.shopId, 10), shopName);
	}
};

main();
