/* eslint-disable no-restricted-syntax */
import '../../../config/mongoose.js';

import axios from 'axios';

import Products from '../../../models/Products.js';
import logger from '../../../config/log.js';

const MAX_CHUNK = 100;

const headers = {
	'user-agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36',
	cookie: 'SPC_F=j9U91Htvys1iZfRnRqRA4snjKON8ULHB; REC_T_ID=dc4ce6d0-a857-11ed-a638-1ec00c3073a9; SPC_CLIENTID=ajlVOTFIdHZ5czFpzazeimbhfjykwuuy; SPC_U=226339550; SPC_R_T_ID=dTzqd5od77kEylN1KPe69o5aqgx7ZRCQxD4G6X4RQtfqvXsz3EPW/eUs2YZUj/7Sh9yigNUkl9oJSZPQ1NCu5E4pFG24d6Xz8anHC+8IKCKXmHxX9lsP6WhM1vMIvlWf2XZTQ1M5CemnAVZmDcrAYVx/Y/aRaEWVKkNFcOMv9iI=; SPC_R_T_IV=ajU3U1lvZGM2UWJmVUxnag==; SPC_T_ID=dTzqd5od77kEylN1KPe69o5aqgx7ZRCQxD4G6X4RQtfqvXsz3EPW/eUs2YZUj/7Sh9yigNUkl9oJSZPQ1NCu5E4pFG24d6Xz8anHC+8IKCKXmHxX9lsP6WhM1vMIvlWf2XZTQ1M5CemnAVZmDcrAYVx/Y/aRaEWVKkNFcOMv9iI=; SPC_T_IV=ajU3U1lvZGM2UWJmVUxnag==; SPC_SC_TK=5bf81e55dff91d3cb23ee40f68904bfd; SPC_SC_UD=226339550; SPC_STK=st3R2g6SkEH/ayiewhjGixA9LOGKT9nxezb5XBJyt1jg/w9HJfjkqe14SX/WEraCxnLBWTdQo4VTSTEJa7AIhZtAGWZorA8LtDWOV8MSu6vmqP/rie7LmmEPi2am9sIAUBm7oTmlLqtU6SRG8vT5z+r58SBLbDtpIlRtpg9Tmwk=; SC_DFP=vHeEuaRIeikYklCvYrYCnCBUwHqpMsOK; SPC_ST=.ZWtuZHNJOWNLNmxyelV4NrmlwW2tlcnIlrncMNk71Cxrrl8tB951pNgPkOM03Vs7RoYuWxKQxvr7wtUGmYMC4taXygZ9umaRF4hlwaJYwQJPpYHP9QLk3VBt6NUgfTZ/rNDrfSheqvCEPtGpcxMcFgLhpynLLPUlHNB0SsM/HJ7CLY2xQlMV6KdM7D7v8aj4VTwV1eYdUhKliLNeibtY0A==; __LOCALE__null=VN; csrftoken=Anutsr61VFSMDf8TJ3PcgF2tmz0BCplp; SPC_SI=7gJaZAAAAABVaTRneDNEYf/hyQAAAAAAT3EyRVE3QXQ=; _QPWSDCXHZQA=453e31d0-262e-4785-f8fa-6b333b1a24d8; SPC_IA=1; SPC_EC=N1lOYjJPSVFUWmdqcnR0UWaZVL4Iu0hFmAxEIKFzFy77GnD2e+X3jNwb7iT7TYf1s2rl/rIHCzeGgPCLKfga/t7IvCipllnHQ0dUctUQoJ2uFhqMQm2iRjcN4SkCxAag90OCjYl0SIxlKHtho8kwLu4eDKbL5VH/RpNdtDgVjEo=; shopee_webUnique_ccd=H861lUa05fRmjXXwuPuFDg%3D%3D%7CF%2FJZGryyQ2TC9zDMfTBhjjPLuE%2Fkem7f%2FpcQlc6RSq5%2Fq3dk2P5%2B9Wjchggp3OnIlEXUF4XXcf3rSSXD%2BGmhfOuyCuIeLgESQn8D%7CCXdm%2FLQv9IRMAqgg%7C06%7C3; ds=463c64dcfdf909a0b20a528ee1b557c8',
	'af-ac-enc-dat': 'AAcyLjguMS0yAAABiCNEn4IAABCAAvAAAAAAAAAAAlkZhtcwue+s/EDjTtHCE5qO69QME94FRs4sg2DhwZhG8GouCNCIT2kMrAkA5KaskMfzMF8JbQikjLNwW3HQ8tSNePyUoeHZeIB1+V7J4xIN1ktm9kRsJHsNmJuYzmpdQBldwvNnuezIffQqtMrGGlSkKzR/XLmp6KDo2tBx7a4FTfTELBHic1fXp8WsGAEheJs3LwOiumEJsgRa2Siv0iWq8i0uTOthx+LmzT6BZTUxAx5i216gTV29RSlT0T8hA1p+no2JRHNybrobure76HXxEapKnA0VCM+39YD596ftNmQDAHuSdbeX1GOxzWQj82yUf1G0y5WLb/4O97leNkLwzVk+VmumMhlzmVvx5L9yRYm4QZf/NhMnw8f21UXD2mkb2JuX/zYTJ8PH9tVFw9ppG9ibpRvtKLGXPc7L/lYI4wA7fEIOFo0CR/WQR0f62Op0/2ymKzuYb9TKZa9fBb7wTASid9Xlrg6itGJDzdFNoXA3Y2vYrXCTAEFvG8oVaNrW7fdz7v12ZUStMpJbV6lmcDwX6lVsWgr7elbfb6kfS3Y5lymr65nLCX9d3zJv/1PfFfKfJrPMih+1Ky8gE0lQsFMQkEkzXzlUminZqx7uiyz8fwdkiN8+z51AiDrNQEi+GcYW22UnmqcFJzflGe3QSfT1rttXMJSDlsLaZL6s1XzimLzS3eMnf3rssxG4274F77Yxeoaslrf0y1o1OtLcfWU5VGJl5oskJUlTRJ8bl1EvJVhMGcyMonXRA5D4UpTZXKaXQp7UCntjdMHHmvtH0GAhzBWLk1aMdDryctvQTFwKWFL+XVbFXV1YJvaeAoBtC3eHo5hmRpdTL95mzSRNH0Y+kzeB12vls5m1Ot98XCnw3/o/Y7MYwm8G85WhegQH8A2pfZzrKY/1YU+VQCo3KjN6SRWWKNU+l658iyftevUkvJf/NhMnw8f21UXD2mkb2JvGxJsAHg8YOTDoomXzOhPDOWAbosnO1+hOu102z4A5Ww==',
};

const fetchProductData = async (id, url) => {
	const [shopId, itemId] = url.split('-i.')[1].split('.');
	const URL_ENDPOINT = `https://shopee.vn/api/v4/item/get?itemid=${itemId}&shopid=${shopId}`;

	const { data } = await axios.get(URL_ENDPOINT, {
		headers,
	});

	const {
		description,
		categories,
	} = data.data;

	// remove first category
	categories.shift();

	await Products.updateProductById(id, {
		description,
		category: categories.map((category) => category.display_name),
	});
	logger.info(`Updated product ${id} with ${categories.map((category) => category.display_name).join(', ')}`);
};

const mainMigration = async () => {
	const allShopeeProducts = (await Products.getAllProductByDomain('shopee.vn'))
		.map((product) => ({
			_id: product._id,
			url: product.url,
		}));

	// split to sub array with MAX_CHUNK
	const allShopeeProductsChunks = [];
	for (let i = 0; i < allShopeeProducts.length; i += MAX_CHUNK) {
		allShopeeProductsChunks.push(allShopeeProducts.slice(i, i + MAX_CHUNK));
	}

	for (const chunk of allShopeeProductsChunks) {
		await Promise.all(chunk.map(({ _id, url }) => fetchProductData(_id, url)));
	}
};

mainMigration();
