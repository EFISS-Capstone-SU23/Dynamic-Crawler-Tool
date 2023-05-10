import logger from '../../../config/log.js';
import { getElementByXpath, getElementsByCss } from '../../../utils/getElement.js';
import {
	MAX_PAGE,
	SEARCH_CONTAINER,
} from '../xPath.js';
import { delay } from '../../../utils/delay.js';

const getMaxPage = async (shopId, driver) => {
	const shopHomeURL = `https://shopee.vn/${shopId}?page=0&sortBy=pop`;
	driver.get(shopHomeURL);
	await delay(30 * 1000);

	const maxPageEl = await getElementByXpath(driver, MAX_PAGE);
	return maxPageEl.getText();
};

export default async function getAllProductLink(shopId, driver) {
	const maxPage = await getMaxPage(shopId, driver);
	logger.info(`Max page: ${maxPage}`);

	const allProductLink = [];
	for (let page = 0; page < maxPage; page++) {
		logger.info(`Get page ${page}`);

		const shopHomeURL = `https://shopee.vn/${shopId}?page=${page}&sortBy=pop`;
		driver.get(shopHomeURL);
		await delay(20 * 1000);

		const containerEl = await getElementByXpath(driver, SEARCH_CONTAINER);

		// get all link in container
		const linkEls = await getElementsByCss(containerEl, 'a') || [];

		// get all link
		const linkArr = await Promise.all(linkEls.map(async (linkEl) => {
			const href = await linkEl.getAttribute('href');
			return href;
		}));

		// concat all link
		allProductLink.push(...linkArr);
	}

	logger.info(`Get all product link: ${allProductLink.length}`);
	return allProductLink;
}
