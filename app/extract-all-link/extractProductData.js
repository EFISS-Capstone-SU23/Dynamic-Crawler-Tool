/* eslint-disable no-promise-executor-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import Products from '../../models/Products.js';
import { saveFileFromURL, getExtFromUrl } from '../../utils/file/saveFileFromURL.js';
import logger from '../../config/log.js';
import { getElementByXpath, getElementsByCss } from '../../utils/getElement.js';
import { IMAGE_ALL_EXT, DELAY_LOADING_PRODUCT } from '../../config/config.js';
import { getDiffHeight, scrollElement } from '../../utils/scrollElement.js';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractProductData = async (driver, xPath, imageLinkProperties = 'src') => {
	const {
		title,
		price,
		description,
		imageContainer,
		metadata,
	} = xPath;

	const titleElement = await getElementByXpath(driver, title);
	if (!titleElement) {
		return {};
	}

	const priceElement = await getElementByXpath(driver, price);
	if (!priceElement) {
		return {};
	}

	const descriptionElement = await getElementByXpath(driver, description);
	if (!descriptionElement) {
		return {};
	}

	// await delay(DELAY_LOADING_PRODUCT);
	const imageContainerElement = await getElementByXpath(driver, imageContainer);

	if (!titleElement || !priceElement || !descriptionElement || !imageContainerElement) {
		return {};
	}

	const titleText = await titleElement.getText();
	const priceText = await priceElement.getText();
	const descriptionText = await descriptionElement.getText();

	const imgElements = await getElementsByCss(imageContainerElement, 'img') || [];

	// scroll the page to load all images
	const diffHeight = await getDiffHeight(imageContainerElement);

	if (diffHeight > 0) {
		await scrollElement(driver, imageContainerElement, diffHeight, imgElements.length);
		await delay(DELAY_LOADING_PRODUCT);
	}

	let imageLinks = [];

	// loop through all image elements
	for (const imgElement of imgElements) {
		try {
			const src = await imgElement.getAttribute(imageLinkProperties);

			// check if image is valid
			if (IMAGE_ALL_EXT.some((ext) => src.includes(`.${ext}`))) {
				// remove query in url
				const url = new URL(src);
				url.search = '';
				imageLinks.push(url.toString());
			}
		} catch (error) {
			logger.error('Error when get image src');
			logger.error(error);
		}
	}
	// remove imageLinks duplicate
	imageLinks = [...new Set(imageLinks)];

	// get all metadata by for key value
	const metadataValue = {};
	for (const key in metadata) {
		const value = metadata[key];

		const element = await getElementByXpath(driver, value);
		if (element) {
			const text = await element.getText();
			metadataValue[key] = text;
		} else {
			metadataValue[key] = '';
		}
	}

	return {
		title: titleText,
		price: priceText,
		description: descriptionText,
		imageLinks,
		metadata: metadataValue,
	};
};

export const saveProductData = async (productData, url) => {
	const {
		title,
		price,
		description,
		imageLinks,
		metadata,
	} = productData;

	// save product data to database
	const product = await Products.insertNewProduct({
		title,
		price,
		description,
		url,
		metadata,
	});

	// only domain name
	const domain = new URL(url).hostname;

	// download image in imageLinks
	const imagePath = [];
	for (let i = 0; i < imageLinks.length; i += 1) {
		const imageLink = imageLinks[i];
		// download image
		const ext = getExtFromUrl(imageLink);
		// output/<site name>/<id>_<site_name_with_under_score>.jpg
		const path = `./output/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}.${ext}`;
		await saveFileFromURL(imageLink, path);
		imagePath.push(path);
	}

	// save product image path to database
	await Products.updateProductById(product._id, {
		images: imagePath,
	});
};
