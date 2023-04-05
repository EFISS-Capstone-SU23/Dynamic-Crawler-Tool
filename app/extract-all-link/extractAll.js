/* eslint-disable no-restricted-syntax */
import {
	By,
} from 'selenium-webdriver';

import getDriverArray from '../../utils/getDriverArray.js';

const startExtractPage = async (driver, url) => new Promise(async (resolve) => {
	console.log(`Start extract page: ${url}`);
	if (!url) {
		resolve([]);
		return;
	}

	driver.get(url);

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

	const queue = [startUrl];

	while (queue.length > 0) {
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
				if (!visitedURL[url]) {
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
