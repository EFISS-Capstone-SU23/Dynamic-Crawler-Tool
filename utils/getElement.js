import {
	By,
} from 'selenium-webdriver';

export const getElementByXpath = async (driver, xpath) => {
	try {
		return await driver.findElement(By.xpath(xpath));
	} catch (error) {
		return null;
	}
};

export const getElementsByXpath = async (driver, xpath) => {
	try {
		return await driver.findElements(By.xpath(xpath));
	} catch (error) {
		return null;
	}
};

export const getElementsByCss = async (driver, css) => {
	try {
		// find all elements
		return await driver.findElements(By.css(css));
	} catch (error) {
		return null;
	}
};
