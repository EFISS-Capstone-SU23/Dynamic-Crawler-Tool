import '../../../config/mongoose.js';

import Products from '../../../models/Products.js';

const MAX_CHUNK = 100;

const mainMigration = async () => {
	const allShopeeProducts = (await Products.getAllProductByDomain('shopee.vn'))
		.map((product) => ({
			_id: product._id,
			url: product.url,
		}));

	// split to sub array with MAX_CHUNK
	const allShopeeProductsChunks = [];
	for (let i = 0; i < allShopeeProducts.length; i += MAX_CHUNK) {
		allShopeeProductsChunks.push(allShopeeProducts.slice(i, i + MAX_CHUNK));
	}
};
