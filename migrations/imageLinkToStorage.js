import '../config/env.js';
import '../config/mongoose.js';

import { STORAGE_PREFIX } from '../config/config.js';
import { bucketName } from '../app/storage/index.js';
import Products from '../models/Products.js';

const main = async () => {
	// Get all products
	const products = await Products.getAllProduct();

	for (const product of products) {
		// if group not contain shopee
		if (product.url.includes('shopee')) {
			continue;
		}

		const { _id, images } = product;
		// `./output/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`
		//  to `${STORAGE_PREFIX}/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`

		const newImageLinks = images.map((imageLink) => {
			if (imageLink.includes('storage.googleapis.com')) {
				return imageLink;
			}

			const filePath = imageLink.replace('./output/', '');
			return `https://storage.googleapis.com/${bucketName}/${STORAGE_PREFIX}/${filePath}`;
		});

		await Products.updateProductById(_id, {
			imageLinks: newImageLinks,
		});

		console.log(`Product ${_id} updated`);
		console.log(newImageLinks);
	}
};

main();
