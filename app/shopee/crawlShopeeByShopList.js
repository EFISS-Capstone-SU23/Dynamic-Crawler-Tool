import fs from 'fs';

import '../../config/env.js';
import '../../config/mongoose.js';
import getShopData from './pipeline/getShopData.js';

const DATA_PATH = './app/shopee/data/shopList_output.json';
const CHECKED_URL_PATH = './cache/shopeeCheckedURL.json';
const CHECKED_SHOP_ID_PATH = './cache/shopeeCheckedShopId.json';

const WORKER_NUMBER = 2;

const main = async () => {
	const currentShopName = 'FACIOSHOP.COM';

	let shopInfo = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

	let checkedURL = {};
	if (fs.existsSync(CHECKED_URL_PATH)) {
		checkedURL = JSON.parse(fs.readFileSync(CHECKED_URL_PATH, 'utf8'));
	}

	let checkedShopId = {};
	if (fs.existsSync(CHECKED_SHOP_ID_PATH)) {
		checkedShopId = JSON.parse(fs.readFileSync(CHECKED_SHOP_ID_PATH, 'utf8'));
	}

	if (currentShopName) {
		// get all shop after currentShopName and currentShopName
		const currentShopIndex = shopInfo.findIndex((shop) => shop.shopName === currentShopName);
		console.log('currentShopIndex', currentShopIndex);
		shopInfo = shopInfo.slice(currentShopIndex);
	}
	console.log('shopInfo', shopInfo.length);

	// suffle shopInfo
	shopInfo.sort(() => Math.random() - 0.5);

	// split shopInfo to WORKER_NUMBER parts
	const shopInfoParts = [];
	for (let i = 0; i < WORKER_NUMBER; i++) {
		shopInfoParts.push([]);
	}
	for (let i = 0; i < shopInfo.length; i++) {
		shopInfoParts[i % WORKER_NUMBER].push(shopInfo[i]);
	}

	const worker = async (shopInfoPart) => {
		// random delay between 0 and 5s
		const delayTime = Math.random() * 5000;
		// eslint-disable-next-line no-promise-executor-return
		await new Promise((resolve) => setTimeout(resolve, delayTime));

		for (const shop of shopInfoPart) {
			const shopName = `shopee-${shop.shopName}`;
			await getShopData(parseInt(shop.shopId, 10), shopName, checkedURL, checkedShopId);
		}
	};
	const workerPromise = shopInfoParts.map((shopInfoPart) => worker(shopInfoPart));
	await Promise.all(workerPromise);
};

main();
