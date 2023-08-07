import '../config/env.js';
import '../config/mongoose.js';
// import productAPI from '../api/productAPI.js';
import Products from '../models/Products.js';

const main = async () => {
	const products = await Products.getAllProduct();

	for (const product of products) {
		const { shopName, _id, url } = product;

		if (!shopName) {
			const domain = new URL(url).hostname;
			await Products.updateProductById(_id, {
				shopName: domain,
				originalImages: [],
			});
			console.log(`Product ${_id} updated`);
		}
	}
};

main();
