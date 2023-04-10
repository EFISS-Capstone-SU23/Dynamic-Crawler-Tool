import { By } from 'selenium-webdriver';

const selectors = {
	title: '//*[@id="maincontent"]/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[1]/h1/span',
	price: '//*[@id="product-price-3095"]/span',
	description: '//*[@id="accordion"]/div[1]/div/div/div/div',
	imageContainer: '//*[@id="gallery_list"]',
};

export const extractProductData = async (driver, url) => {
	const {
		title,
		price,
		description,
		imageContainer,
	} = selectors;

	await driver.get(url);

	const titleElement = await driver.findElement(By.xpath(title));
	const priceElement = await driver.findElement(By.xpath(price));
	const descriptionElement = await driver.findElement(By.xpath(description));
	const imageContainerElement = await driver.findElement(By.xpath(imageContainer));

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
