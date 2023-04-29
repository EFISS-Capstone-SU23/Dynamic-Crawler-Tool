/* eslint-disable no-promise-executor-return */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import {
	By,
} from 'selenium-webdriver';
import fs from 'fs';
import optimist from 'optimist';

import getDriverArray from '../../utils/getDriverArray.js';
import {
	extractProductData,
	saveProductData,
} from './extractProductData.js';
import Products from '../../models/Products.js';
import logger from '../../config/log.js';
import {
	saveJsonToFile,
} from '../../utils/file/saveFileFromURL.js';
import {
	getElementByXpath,
} from '../../utils/getElement.js';
import transfromURL from '../../utils/transformURL.js';
import {
	MAX_CLICK_PAGE,
} from '../../config/config.js';

const DEV_MOD = optimist.argv.dev || false;

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startExtractPage = async (driver, url, downloadedURL, params) => new Promise(async (resolve) => {
	logger.info(`Open page: ${url}`);
	if (!url) {
		resolve([]);
		return;
	}

	const {
		xPath,
	} = params;

	driver.get(url);

	// wait for page to load
	await driver.wait(() => driver.executeScript('return document.readyState').then((readyState) => readyState === 'complete'), 10000);

	// Try to extract product data
	// if (downloadedURL[url]) {
	if (!downloadedURL[url] || DEV_MOD) {
		const productData = await extractProductData(driver, xPath);
		if (productData && productData.title && productData.price && productData.description && (productData.imageLinks || []).length > 0) {
			logger.info(`Extract product data: ${url}`);
			downloadedURL[url] = true;
			await saveProductData(productData, url);
		}
	}

	const output = [];

	const getLinks = async () => {
		const links = await driver.findElements(By.css('a'));

		for (const link of links) {
			try {
				const href = await link.getAttribute('href');

				if (href !== null) {
					output.push(href);
				}
			} catch (error) {
				// logger.error(`Error when get href: ${url}`);
				// logger.error(error);
			}
		}
	};

	if (xPath.paginationButton) {
		let counter = 0;
		while (true) {
			await getLinks();

			if (counter >= MAX_CLICK_PAGE) {
				break;
			}

			const nextButton = await getElementByXpath(driver, xPath.paginationButton);
			// check buton exist and clickable
			try {
				if (nextButton && await nextButton.isDisplayed() && await nextButton.isEnabled()) {
					logger.info(`Click next button: ${url}, counter: ${counter}`);
					await nextButton.click();
					await delay(5 * 1000);
					counter += 1;
				} else {
					break;
				}
			} catch (error) {
				logger.error('Error when click next button', url);
				logger.error(error);
				break;
			}
		}
	} else {
		await getLinks();
	}

	resolve(output);
});

const filterQueue = (queue, visitedURL, ignoreURLsRegex, domain) => {
	// filter ignore url with regex and filter visited url
	queue = queue.filter((url) => {
		if (!url.includes(domain)) {
			return false;
		}

		let isIgnore = false;
		ignoreURLsRegex.forEach((ignoreURL) => {
			if (url.match(ignoreURL)) {
				isIgnore = true;
			}
		});
		return !isIgnore && !visitedURL[url];
	});

	// suffle queue
	queue.sort(() => Math.random() - 0.5);

	return queue;
};

const _extractAll = async (params, driverArray) => {
	const {
		startUrl,
		maxDriver,
		continueExtract,
		ignoreURLs,
	} = params;

	const visitedURL = {};
	const downloadedURL = {};

	const domain = new URL(startUrl).hostname;
	let queue = [
		transfromURL(startUrl, domain),
	];

	// convert string to regex
	const ignoreURLsRegex = ignoreURLs.map((url) => new RegExp(url));

	if (continueExtract) {
		// check if cached file exist then load it into visitedURL and queue
		if (fs.existsSync(`./cache/visited-${domain}.json`) && fs.existsSync(`./cache/queue-${domain}.json`)) {
			const visitedURLFile = fs.readFileSync(`./cache/visited-${domain}.json`, 'utf8');
			const queueFile = fs.readFileSync(`./cache/queue-${domain}.json`, 'utf8');

			if (visitedURLFile && queueFile) {
				Object.assign(visitedURL, JSON.parse(visitedURLFile));
				queue = JSON.parse(queueFile);

				queue = filterQueue(queue, visitedURL, ignoreURLsRegex, domain);
			}
		}
	}

	// get all product with domain and mask as downloaded
	const products = await Products.getAllProductByDomain(domain);
	products.forEach((product) => {
		downloadedURL[product.url] = true;
	});

	while (queue.length > 0) {
		// get url array for this batch
		const urlArray = queue.splice(0, maxDriver);

		// update visited url
		urlArray.forEach((url) => {
			visitedURL[url] = true;
		});

		// start extract page and return promise array
		const promiseArray = urlArray.map((url, index) => startExtractPage(driverArray[index], url, downloadedURL, params));

		// wait for all promise to resolve
		const resultArray = await Promise.all(promiseArray);

		// merge result array to queue
		resultArray.forEach((result) => {
			result.forEach((url) => {
				if (url) {
					queue.push(transfromURL(url, domain));
				}
			});
		});

		// filter duplicate url in queue via set
		// const set = new Set(queue);
		// queue = [...set];
		queue = filterQueue(queue, visitedURL, ignoreURLsRegex, domain);
		logger.info(`Queue length: ${queue.length}`);

		// Save visited url to file and queue to file
		saveJsonToFile(visitedURL, `./cache/visited-${domain}.json`);
		saveJsonToFile(queue, `./cache/queue-${domain}.json`);
	}
};

export default async function extractAll(params) {
	const {
		startUrl,
		maxDriver,
	} = params;
	logger.info(`Start extract all link from: ${startUrl}, max driver: ${maxDriver}`);
	const driverArray = getDriverArray(maxDriver);

	try {
		await _extractAll(params, driverArray);
	} finally {
		// close all driver
		driverArray.forEach((driver) => {
			driver.quit();
		});
	}

	logger.info('Finish extract all link.');
}
