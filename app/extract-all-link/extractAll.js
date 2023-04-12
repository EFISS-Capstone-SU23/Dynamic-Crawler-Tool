/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import {
	By,
} from 'selenium-webdriver';

import getDriverArray from '../../utils/getDriverArray.js';
import { extractProductData, saveProductData } from './extractProductData.js';
import Products from '../../models/Products.js';
import logger from '../../config/log.js';
import { saveJsonToFile } from '../../utils/file/saveFileFromURL.js';

const startExtractPage = async (driver, url, downloadedURL) => new Promise(async (resolve) => {
	logger.info(`Open page: ${url}`);
	if (!url) {
		resolve([]);
		return;
	}

	driver.get(url);

	// wait for page to load
	await driver.wait(() => driver.executeScript('return document.readyState').then((readyState) => readyState === 'complete'), 10000);

	// Try to extract product data
	if (!downloadedURL[url]) {
		const productData = await extractProductData(driver);

		if (productData && productData.title && productData.price && productData.description && (productData.imageLinks || []).length > 0) {
			logger.info(`Extract product data: ${url}`);
			downloadedURL[url] = true;
			await saveProductData(productData, url);
		}
	}

	const output = [];
	const links = await driver.findElements(By.css('a'));

	for (const link of links) {
		try {
			const href = await link.getAttribute('href');

			if (href !== null) {
				output.push(href);
			}
		} catch (error) {
			logger.error(`Error when get href: ${url}`);
			logger.error(error);
		}
	}

	resolve(output);
});

export default async function extractAll(startUrl, maxDriver) {
	logger.info(`Start extract all link from: ${startUrl}, max driver: ${maxDriver}`);

	const driverArray = getDriverArray(maxDriver);
	const visitedURL = {};
	const downloadedURL = {};

	const domain = new URL(startUrl).hostname;

	// get all product with domain and mask as downloaded
	const products = await Products.getAllProductByDomain(domain);
	products.forEach((product) => {
		downloadedURL[product.url] = true;
	});

	let queue = [startUrl];

	while (queue.length > 0) {
		// filter duplicate url in queue via set
		const set = new Set(queue);
		queue = [...set];

		// get url array for this batch
		const urlArray = queue.splice(0, maxDriver);

		// update visited url
		urlArray.forEach((url) => {
			visitedURL[url] = true;
		});

		// start extract page and return promise array
		const promiseArray = urlArray.map((url, index) => startExtractPage(driverArray[index], url, downloadedURL));

		// wait for all promise to resolve
		const resultArray = await Promise.all(promiseArray);

		// merge result array to queue
		resultArray.forEach((result) => {
			result.forEach((url) => {
				if (url && url.includes(domain) && !visitedURL[url]) {
					queue.push(url);
				}
			});
		});

		logger.info(`Queue length: ${queue.length}`);

		// Save visited url to file and queue to file
		saveJsonToFile(visitedURL, `./cache/visited-${domain}.json`);
		saveJsonToFile(queue, `./cache/queue-${domain}.json`);
	}

	// close all driver
	driverArray.forEach((driver) => {
		driver.quit();
	});
}
