/* eslint-disable no-restricted-syntax */
import {
	By,
} from 'selenium-webdriver';

import Products from '../../models/Products.js';
import saveFileFromURL from '../../utils/file/saveFileFromURL.js';

const selectors = {
	title: '//*[@id="maincontent"]/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[1]/h1/span',
	price: '/html/body/div[7]/main/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[4]/span[1]/span/span/span',
	description: '//*[@id="accordion"]/div[1]/div/div/div/div',
	imageContainer: '//*[@id="gallery_list"]',
};

const getElementByXpath = async (driver, xpath) => {
	try {
		return await driver.findElement(By.xpath(xpath));
	} catch (error) {
		return null;
	}
};

const getElementByCss = async (driver, css) => {
	try {
		// find all elements
		return await driver.findElements(By.css(css));
	} catch (error) {
		return null;
	}
};

export const extractProductData = async (driver) => {
	const {
		title,
		price,
		description,
		imageContainer,
	} = selectors;

	const titleElement = await getElementByXpath(driver, title);
	const priceElement = await getElementByXpath(driver, price);
	const descriptionElement = await getElementByXpath(driver, description);
	const imageContainerElement = await getElementByXpath(driver, imageContainer);

	if (!titleElement || !priceElement || !descriptionElement || !imageContainerElement) {
		return {};
	}

	const titleText = await titleElement.getText();
	const priceText = await priceElement.getText();
	const descriptionText = await descriptionElement.getText();

	const imgElements = await getElementByCss(imageContainerElement, 'img') || [];
	const imageLinks = [];

	// loop through all image elements
	for (const imgElement of imgElements) {
		try {
			const src = await imgElement.getAttribute('src');
			imageLinks.push(src);
		} catch (error) {
			console.log('error');
		}
	}

	return {
		title: titleText,
		price: priceText,
		description: descriptionText,
		imageLinks,
	};
};

export const saveProductData = async (productData, url) => {
	const {
		title,
		price,
		description,
		imageLinks,
	} = productData;

	// save product data to database
	const product = await Products.insertNewProduct({
		title,
		price,
		description,
		url,
	});

	// only domain name
	const domain = new URL(url).hostname;

	// download image in imageLinks
	const imagePath = [];
	for (let i = 0; i < imageLinks.length; i += 1) {
		const imageLink = imageLinks[i];
		// download image
		// data/<site name>/<id>_<site_name_with_under_score>.jpg
		const path = `./data/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}.jpg`;
		await saveFileFromURL(imageLink, path);
		imagePath.push(path);
	}

	// save product image path to database
	Products.updateProductById(product._id, {
		imagePath,
	});
};
