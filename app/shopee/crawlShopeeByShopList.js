import '../../config/env.js';
import '../../config/mongoose.js';

import getShopData from './pipeline/getShopData.js';

const main = async () => {
	const shopInfo = [{
		shopId: '11043',
		shopName: 'Rhodishop',
		shopNameRaw: 'Rhodishop',
	}];

	for (const shop of shopInfo) {
		const shopName = `shopee-${shop.shopName}`;
		await getShopData(parseInt(shop.shopId, 10), shopName);
	}
};

main();
