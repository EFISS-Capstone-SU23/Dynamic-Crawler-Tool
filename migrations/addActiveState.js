import '../config/env.js';
import '../config/mongoose.js';

import Products from '../models/Products.js';

const main = async () => {
	// Get all products
	const products = await Products.getAllProduct();
	const { _db } = Products;

	for (const product of products) {
		const { _id, active, images } = product;

		if (!active) {
			const activeImageMap = images.map(() => true);
			await _db.updateOne({ _id }, { $set: { active: true, activeImageMap } });
		}
		console.log(`Product ${_id} updated`);
	}
	console.log('Done');
};

main();
