import axios from 'axios';

export default async function getShopId(shopName) {
	const res = await axios.get(`https://shopee.vn/api/v4/search/search_user?keyword=${shopName}&limit=1`);

	const shopData = res.data.data.users[0];
	return shopData.shopid;
}
