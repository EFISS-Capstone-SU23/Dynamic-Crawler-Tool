import '../../config/env.js';
import '../../config/mongoose.js';
import Products from '../../models/Products.js';
import convertPrice from '../../utils/convertPrice.js';

// Get all products
const main = async () => {
	const products = await Products.getAllProduct();

	for (const product of products) {
		const { _id, price } = product;

		// convert price to int
		const newPrice = convertPrice(price);

		await Products.updateProductById(_id, {
			price: newPrice,
		});

		console.log(`Product ${_id} updated`);
	}
};

main();
