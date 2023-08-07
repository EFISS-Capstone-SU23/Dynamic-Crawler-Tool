/* eslint-disable no-promise-executor-return */
/* eslint-disable no-loop-func */
/* eslint-disable no-restricted-syntax */
/*  eslint-disable no-unused-vars */
import {
	By,
} from 'selenium-webdriver';
import fs from 'fs';

import getDriverArray from '../../utils/getDriverArray.js';
import {
	extractProductData,
	saveProductData,
} from './extractProductData.js';
import createLog from '../../config/createLog.js';
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
import {
	DEV_MOD,
} from '../../config/parram.js';
import Crawls from '../../models/Crawls.js';
import LogStreamManager from '../log-stream/LogStreamManager.js';
import productAPI from '../../api/productAPI.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const startExtractPage = async (driver, url, downloadedURL, params) => new Promise(async (resolve) => {
	const {
		xPath,
		logger,
		crawlId,
	} = params;

	logger.info(`Open page: ${url}`);
	if (!url) {
		resolve([]);
		return;
	}

	// handle if page not existed
	try {
		driver.get(url);
	} catch (error) {
		resolve([]);
	}

	// wait for page to load
	await driver.wait(() => driver.executeScript('return document.readyState').then((readyState) => readyState === 'complete'), 10000);

	// Try to extract product data
	// if (downloadedURL[url]) {
	if (!downloadedURL[url] || DEV_MOD) {
		const productData = await extractProductData(driver, xPath, logger);
		if (productData && productData.title && productData.price && productData.description && (productData.imageLinks || []).length > 0) {
			logger.info(`Extract product data: ${url}`);
			downloadedURL[url] = true;
			await saveProductData(productData, url, logger, crawlId);
		}
	}

	const output = [];
	const start = Date.now();
	const getLinks = async () => {
		// const links = await driver.findElements(By.css('a'));

		// for (const link of links) {
		// 	try {
		// 		const href = await link.getAttribute('href');

		// 		if (href !== null) {
		// 			output.push(href);
		// 		}
		// 	} catch (error) {
		// 		// logger.error(`Error when get href: ${url}`);
		// 		// logger.error(error);
		// 	}
		// }

		// get html of body tag in the page, then extract all link from it (faster)
		const bodyElement = await getElementByXpath(driver, '/html/body');
		if (bodyElement) {
			const bodyHTML = await bodyElement.getAttribute('innerHTML');
			const regex = /href="([^"]*)"/g;
			const matches = bodyHTML.matchAll(regex);

			for (const match of matches) {
				const href = match[1];
				if (href) {
					output.push(href);
				}
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
	console.log(`Finish get body html in ${(Date.now() - start) / 1000}s`);
	resolve(output);
});

const filterQueue = (queue, visitedURL, ignoreURLsRegex, domain) => {
	// filter duplicate url in queue
	const set = new Set(queue);
	queue = [...set];

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
		numInstance,
		continueExtract,
		ignoreUrlPatterns,
		crawlId,
		logger,
	} = params;

	const visitedURL = {};

	const domain = new URL(startUrl).hostname;
	let queue = [
		transfromURL(startUrl, domain),
	];

	// convert string to regex
	const ignoreURLsRegex = ignoreUrlPatterns.map((url) => new RegExp(url));

	if (continueExtract) {
		// check if cached file exist then load it into visitedURL and queue
		if (fs.existsSync(`./cache/visited-${crawlId}.json`) && fs.existsSync(`./cache/queue-${crawlId}.json`)) {
			const visitedURLFile = fs.readFileSync(`./cache/visited-${crawlId}.json`, 'utf8');
			const queueFile = fs.readFileSync(`./cache/queue-${crawlId}.json`, 'utf8');

			if (visitedURLFile && queueFile) {
				Object.assign(visitedURL, JSON.parse(visitedURLFile));
				queue = JSON.parse(queueFile);

				queue = filterQueue(queue, visitedURL, ignoreURLsRegex, domain);
			}
		}
	}

	// get all product with domain and mask as downloaded
	const downloadedURL = await productAPI.getDownloadedProductURL(domain);
	while (queue.length > 0) {
		// Check status of crawl if it runnning
		const crawl = await Crawls.findOneById(crawlId);

		if (!crawl || crawl.status !== 'running') {
			logger.info(`Crawler status is: ${crawl.status}`);
			break;
		}

		// get url array for this batch
		const urlArray = queue.splice(0, numInstance);

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
					const transfromedURL = transfromURL(url, domain);
					if (transfromedURL) {
						queue.push(transfromedURL);
					}
				}
			});
		});

		queue = filterQueue(queue, visitedURL, ignoreURLsRegex, domain);
		logger.info(`Queue length: ${queue.length}`);

		// Save visited url to file and queue to file
		saveJsonToFile(visitedURL, `./cache/visited-${crawlId}.json`);
		saveJsonToFile(queue, `./cache/queue-${crawlId}.json`);

		// emit to client
		LogStreamManager.emitVisitedURLs(Object.keys(visitedURL), crawlId);
		LogStreamManager.emitQueue(queue, crawlId);
	}
};

const quitAllDriver = (driverArray) => {
	driverArray.forEach((driver) => {
		driver.quit();
	});
};

export default async function extractAll(params) {
	const {
		startUrl,
		numInstance,
		crawlId,
	} = params;
	const logger = createLog(crawlId);

	// create cache file
	const visitedURLPath = `./cache/visited-${crawlId}.json`;
	const queuePath = `./cache/queue-${crawlId}.json`;

	if (!fs.existsSync(visitedURLPath)) {
		fs.writeFileSync(visitedURLPath, '{}');
	}

	if (!fs.existsSync(queuePath)) {
		fs.writeFileSync(queuePath, '[]');
	}

	logger.info('===================');
	logger.info(`Start extract all link from: ${startUrl}, max driver: ${numInstance}`);

	await delay(2 * 2000);
	const driverArray = getDriverArray(numInstance);

	params.logger = logger;
	try {
		await _extractAll(params, driverArray);

		logger.info('Finish extract all link.');
		logger.info('Quit all driver');
		quitAllDriver(driverArray);

		// update status of crawl
		Crawls.updateStatus(crawlId, 'stopped');
	} catch (error) {
		logger.error('Error when extract all link');
		logger.error(error);
		logger.info('Quit all driver');
		quitAllDriver(driverArray);

		// update status of crawl
		Crawls.updateStatus(crawlId, 'paused');
	}
}
