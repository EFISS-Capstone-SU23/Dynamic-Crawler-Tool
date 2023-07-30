import axios from 'axios';

const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || 'http://localhost:3002';

const instance = axios.create({
	baseURL: `${PRODUCT_SERVICE_URL}/`,
});

export default {
	insertNewProduct: async (product) => {
		const res = await instance.post('/new', product);
		return res.data.product;
	},
};
