import mongoose from 'mongoose';

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
	images: {
		type: [String],
	},
	metadata: {
		type: Object,
	},
});

const _db = mongoose.model('Product', ProductSchema);

const Product = {
	insertNewProduct: async (product) => _db.create(product),
	updateProductById(id, product) {
		const query = { _id: id };
		const update = {
			$set: product,
		};
		return _db.updateOne(query, update);
	},
};

export default Product;
