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
	updateProductById: async (id, product) => {
		const res = await instance.post(`/update/${id}`, product);
		return res.data.product;
	},
	getDownloadedProductURL: async (domain) => {
		const res = await instance.get(`/downloadedUrls/${domain}`);
		return res.data.downloadedURL;
	},
	deleteProductById: async (id) => {
		const res = await instance.delete(`/delete/${id}`);
		return res.data;
	},
};
