import mongoose from 'mongoose';

import convertPrice from '../utils/convertPrice';

const ProductSchema = new mongoose.Schema({
	title: {
		type: String,
		required: true,
	},
	url: {
		type: String,
		required: true,
	},
	price: {
		type: String,
		required: true,
	},
	description: {
		type: String,
	},
	category: {
		type: [String],
	},
	original_images: {
		type: [String],
	},
	images: {
		type: [String],
	},
	metadata: {
		type: Object,
	},
	group: {
		type: String,
	},
});

const _db = mongoose.model('Product', ProductSchema);

const Product = {
	insertNewProduct: async (product) => {
		if (product.price) {
			product.price = convertPrice(product.price);
		}

		return _db.create(product);
	},
	async updateProductById(id, product) {
		// if (product.price) {
		// 	product.price = convertPrice(product.price);
		// }

		const updatedProduct = await _db.findOneAndUpdate(
			{ _id: id },
			{ $set: product },
			{ new: true },
		);
		return updatedProduct;
	},
	getAllProductByDomain(domain) {
		// query url have domain
		const query = {
			url: {
				$regex: `^https?://${domain}`,
			},
		};
		return _db.find(query);
	},
	getAllProduct() {
		return _db.find({});
	},
	async getDownloadedProductURL(domain) {
		const downloadedURL = {};

		const products = await this.getAllProductByDomain(domain);
		products.forEach((product) => {
			downloadedURL[product.url] = true;
		});

		return downloadedURL;
	},
};

export default Product;
