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

export const extractProductData = async (driver, url) => {
	const {
		title,
		price,
		description,
		imageContainer,
	} = selectors;

	await driver.get(url);

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
	const imageLink = await imageContainerElement.getAttribute('src');

	return {
		title: titleText,
		price: priceText,
		description: descriptionText,
		imageLink,
	};
};

export const saveProductData = async (productData) => {
	const {
		title,
		price,
		description,
		imageLink,
	} = productData;

	const product = {
		title,
		price,
		description,
		imageLink,
	};

	console.log(product);
};
