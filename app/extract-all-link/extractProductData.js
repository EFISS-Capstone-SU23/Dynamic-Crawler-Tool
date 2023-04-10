/* eslint-disable no-restricted-syntax */
import { By } from 'selenium-webdriver';

const selectors = {
	title: '//*[@id="maincontent"]/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[1]/h1/span',
	price: '//*[@id="product-price-3095"]/span',
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
		return await driver.findElement(By.css(css));
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

	const titleElement = getElementByXpath(driver, title);
	const priceElement = getElementByXpath(driver, price);
	const descriptionElement = getElementByXpath(driver, description);
	const imageContainerElement = getElementByXpath(driver, imageContainer);

	if (!titleElement || !priceElement || !descriptionElement || !imageContainerElement) {
		return null;
	}

	const titleText = await titleElement.getText();
	const priceText = await priceElement.getText();
	const descriptionText = await descriptionElement.getText();

	const imgElements = getElementByCss(driver, 'img') || [];
	const imageLinks = [];

	for (const imgElement of imgElements) {
		try {
			const src = await imgElement.getAttribute('src');
			imageLinks.push(src);
		} catch (error) {
			console.log(error);
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
		imageLinks,
	} = productData;

	const domain = new URL(url).origin;

	// download image in imageLinks
	for (let i = 0; i < imageLinks.length; i += 1) {
		const imageLink = imageLinks[i];
		// download image
		// data/<site name>/<id>_<site_name_with_under_score>.jpg
		// const path = `data/${domain}/${imageLink.split('/').slice(-1)[0]}`;
		console.log(imageLink, domain);
	}

	// save product data to database
};
