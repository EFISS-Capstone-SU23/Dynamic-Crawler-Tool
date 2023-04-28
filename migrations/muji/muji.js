/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import fs from 'fs';

import '../../config/mongoose.js';
import Products from '../../models/Products.js';
import logger from '../../config/log.js';

// read and parse json file
const products = JSON.parse(fs.readFileSync('./data/products.json', 'utf8'));

const DATA_PATH = '/media/saplab/Data_Win/RSI_Do_An/AnhND/etl-muji/output/images';

const main = async () => {
	for (const product of products) {
		const { id, images } = product;

		const productData = {
			title: product.name,
			url: product.onlineUrl,
			price: product.price,
			description: product.description,
			metadata: {
				labels: product.labels,
				sizes: product.sizes,
			},
		};

		// insert products
		const newProduct = await Products.insertNewProduct(productData);
		const productId = newProduct._id;

		// move image to output
		const imagesPath = [];
		for (const i in images) {
			const prevPath = `${DATA_PATH}/${id}/${i}.jpg`;
			const newPath = `../../output/www.muji.com/${productId}_${i}_www_muji_com.jpg`;

			// move file from prevPath to newPath
			fs.rename(prevPath, newPath, (err) => {
				if (err) {
					logger.error(err);
				}
			});
			imagesPath.push(newPath);
		}

		// update product images
		await Products.updateProductById(productId, {
			images: imagesPath,
		});

		console.log(`Product ${productId}, ${id} inserted`);
	}
};

main();
