import {
	delay,
} from '../../../utils/delay.js';
import {
	xPath,
} from '../xPath.js';
import {
	getElementByXpath,
	getElementsByXpath,
} from '../../../utils/getElement.js';
import Products from '../../../models/Products.js';
import { saveFileFromURL } from '../../../utils/file/saveFileFromURL.js';

export default async function extractProductData(driver, url, group) {
	driver.get(url);
	await delay(2.5 * 1000);

	// get title
	const titleEl = await getElementByXpath(driver, xPath.TITLE);
	const title = await titleEl.getText();

	// get price
	const priceEl = await getElementByXpath(driver, xPath.PRICE);
	const price = await priceEl.getText();

	// get description
	const descriptionEl = await getElementByXpath(driver, xPath.DESCRIPTION);
	const description = await descriptionEl.getText();

	const product = await Products.insertNewProduct({
		title,
		price,
		description,
		url,
		group,
		metadata: {},
	});

	// get all image, then extract image link from background-image css property
	const imageEl = await getElementsByXpath(driver, xPath.IMAGE);
	const imageLinks = await Promise.all(imageEl.map(async (el) => {
		const style = await el.getAttribute('style');
		const imageLink = style.split('url("')[1].split('")')[0];

		// remove _tn at end of image link
		const imageLinkWithoutTn = imageLink.split('_tn')[0];
		return imageLinkWithoutTn;
	}));

	// save image to local
	const imagePaths = await Promise.all(imageLinks.map(async (imageLink, i) => {
		const path = `./output/${group}/${product._id}_${i}_${group.replace(/[^a-zA-Z0-9]/g, '_')}.jpeg`;
		await saveFileFromURL(imageLink, path);

		return path;
	}));

	// update imagePaths to product
	await Products.updateProductById(product._id, {
		imagePaths,
	});
}
