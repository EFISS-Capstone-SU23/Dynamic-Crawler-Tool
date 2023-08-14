import './config/env.js';
import './config/mongoose.js';

import optimist from 'optimist';
import {
	Builder,
} from 'selenium-webdriver';
// set chrome options
import chrome from 'selenium-webdriver/chrome.js';

import Templates from './models/Templates.js';
import { getElementByXpath, getElementsByCss } from './utils/getElement.js';
import { getDiffHeight, scrollElement } from './utils/scrollElement.js';
import { delay } from './utils/delay.js';
import { DELAY_LOADING_PRODUCT } from './config/config.js';

const getProperty = async (driver, xPath) => {
	const element = await getElementByXpath(driver, xPath);
	if (!element) {
		return null;
	}

	const text = element.getText();
	return text.trim().split('\n')[0];
};

const getImages = async (driver, imageContainerXpath, imageElement, imageLinkProperties) => {
	const imageContainerElement = await getElementByXpath(driver, imageContainerXpath);
	if (!imageContainerElement) {
		return [];
	}

	const imgElements = await getElementsByCss(imageContainerElement, imageElement) || [];

	// scroll the page to load all images
	const diffHeight = await getDiffHeight(imageContainerElement);

	if (diffHeight > 0) {
		await scrollElement(driver, imageContainerElement, diffHeight, imgElements.length);
		await delay(DELAY_LOADING_PRODUCT);
	}

	const imageLinks = [];
	// loop through all image elements
	for (const imgElement of imgElements) {
		try {
			const src = await imgElement.getAttribute(imageLinkProperties);
			// check if image is valid
			imageLinks.push(src);
		} catch (error) {
			imageLinks.push('');
		}
	}

	// remove imageLinks duplicate
	return [...new Set(imageLinks)].filter((el) => el);
};

const main = async () => {
	const TEMPLATE_NAME = optimist.argv.template;
	console.log('TEMPLATE_NAME:', TEMPLATE_NAME);

	// setup chrome driver
	const o = new chrome.Options();
	o.addArguments('disable-infobars');
	o.addArguments('start-maximized');
	o.addArguments('headless');

	// Add Chrome user agent
	o.addArguments('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome');
	o.setUserPreferences({
		credential_enable_service: false,
	});

	const driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(o)
		.build();

	// get template
	const templateData = await Templates.findOneByWebsite(TEMPLATE_NAME);
	if (!templateData) {
		console.error('Template not found');
		process.exit(1);
	}

	// get start url
	const {
		template,
	} = templateData;

	const {
		title,
		price,
		description,
		imageContainer,
		imageElement = 'img',
		imageLinkProperties = 'src',
		startUrl,
	} = template;

	// go to start url
	await driver.get(startUrl);

	const titleText = await getProperty(driver, title);
	const priceText = await getProperty(driver, price);
	const descriptionText = await getProperty(driver, description);
	const imageLinks = await getImages(driver, imageContainer, imageElement, imageLinkProperties);

	console.log('titleText:', titleText);
	console.log('priceText:', priceText);
	console.log('descriptionText:', descriptionText);

	console.log('imageLinks:', imageLinks.length);
	console.log(imageLinks);
};

main();
