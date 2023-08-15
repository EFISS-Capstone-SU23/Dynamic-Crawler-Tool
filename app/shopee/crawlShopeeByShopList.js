import fs from 'fs';

import '../../config/env.js';
import '../../config/mongoose.js';
import getShopData from './pipeline/getShopData.js';

const DATA_PATH = './app/shopee/data/shopList_output.json';
// const CHECKED_URL_PATH = './cache/shopeeCheckedURL.json';
const CHECKED_SHOP_ID_PATH = './cache/shopeeCheckedShopId.json';

const WORKER_NUMBER = 15;

const main = async () => {
	console.log('start crawlShopeeByShopList.js');
	const currentShopName = '';

	let shopInfo = JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));

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

	// filter checked shop
	shopInfo = shopInfo.filter((shop) => !checkedShopId[shop.shopId]);
	console.log('shopInfo length', shopInfo.length);

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

	const worker = async (shopInfoPart, index) => {
		// random delay between 2s and 10s
		const delayTime = Math.floor(Math.random() * 8000) + 2000;
		// eslint-disable-next-line no-promise-executor-return
		setTimeout(async () => {
			for (const shop of shopInfoPart) {
				const shopName = `shopee-${shop.shopName}`;
				try {
					await getShopData(parseInt(shop.shopId, 10), shopName, checkedShopId);
				} catch (error) {
					console.log('error', error);
					console.log('index stop:', index);
					break;
				}
			}
		}, delayTime);
	};
	const workerPromise = shopInfoParts.map((shopInfoPart, i) => worker(shopInfoPart, i));
	await Promise.all(workerPromise);
};

main();
