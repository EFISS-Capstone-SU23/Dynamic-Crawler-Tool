/* eslint-disable no-restricted-syntax */
import axios from 'axios';

const CATEGORY_IDS = [
	11035567,
	11035639,
	11036382,
];

const fetchShopByCategoryId = async (categoryId) => {
	const URL = `https://shopee.vn/api/v4/official_shop/get_shops_by_category?need_zhuyin=0&category_id=${categoryId}`;

	const res = await axios.get(URL);

	return (res.data.data?.brands || [])
		.reduce((cur, el) => cur.concat(el.brand_ids), [])
		.map((el) => ({
			shopId: el.shopid,
			shopName: el.username,
		}));
};

export default async function fetchAllShop() {
	let shops = [];
	for (const categoryId of CATEGORY_IDS) {
		const shopData = await fetchShopByCategoryId(categoryId);
		shops = shops.concat(shopData);
	}

	return shops;
}
