import axios from 'axios';

export default async function getShopId(shopName) {
	const res = await axios.get(`https://shopee.vn/api/v4/search/search_user?keyword=${shopName}&limit=1`);

	const users = res.data.data?.users || [];

	if (!users.length) {
		return null;
	}

	const shopData = users[0];
	return shopData.shopid;
}
