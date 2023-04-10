/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
import {
	By,
} from 'selenium-webdriver';

import getDriverArray from '../../utils/getDriverArray.js';
import { extractProductData, saveProductData } from './extractProductData.js';

const startExtractPage = async (driver, url) => new Promise(async (resolve) => {
	console.log(`Start extract page: ${url}`);
	if (!url) {
		resolve([]);
		return;
	}

	driver.get(url);

	// wait for page to load
	await driver.wait(() => driver.executeScript('return document.readyState').then((readyState) => readyState === 'complete'), 10000);

	// Try to extract product data
	const productData = await extractProductData(driver);

	if (productData) {
		console.log(`Extract product data: ${url}`);
		saveProductData(productData);
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
			console.log(error);
		}
	}

	resolve(output);
});

export default async function extractAll(startUrl, maxDriver) {
	const driverArray = getDriverArray(maxDriver);
	const visitedURL = {};

	const domain = new URL(startUrl).origin;

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
		const promiseArray = urlArray.map((url, index) => startExtractPage(driverArray[index], url));

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

		console.log(`Queue length: ${queue.length}`);
	}

	// close all driver
	driverArray.forEach((driver) => {
		driver.quit();
	});
}
