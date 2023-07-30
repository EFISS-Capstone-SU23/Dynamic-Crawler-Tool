/* eslint-disable no-promise-executor-return */
/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
import Products from '../../models/Products.js';
import { saveFileFromBuffer, getFileBufferFromURL } from '../../utils/file/saveFileFromURL.js';
import { getElementByXpath, getElementsByCss } from '../../utils/getElement.js';
import { IMAGE_ALL_EXT, DELAY_LOADING_PRODUCT, STORAGE_PREFIX } from '../../config/config.js';
import { getDiffHeight, scrollElement } from '../../utils/scrollElement.js';
import { transformImageURL } from '../../utils/transformURL.js';
import { removeSmallImage, checkFileTypeByContent } from '../../utils/file/imageFile.js';
import { bucketName } from '../storage/index.js';
import Crawls from '../../models/Crawls.js';
import productAPI from '../../api/productAPI.js';

const FILE_STORAGE_TYPE = process.env.FILE_STORAGE_TYPE || 'local';

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

export const extractProductData = async (driver, xPath, logger) => {
	const {
		title,
		price,
		description,
		imageContainer,
		metadata,
		imageElement = 'img',
		imageLinkProperties = 'src',
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

	// const imgElements = await getElementsByXpath(imageContainerElement, imageElement) || [];
	// We need to use css selector instead of xpath because of length
	const imgElements = await getElementsByCss(imageContainerElement, imageElement) || [];

	// scroll the page to load all images
	const diffHeight = await getDiffHeight(imageContainerElement);

	if (diffHeight > 0) {
		await scrollElement(driver, imageContainerElement, diffHeight, imgElements.length, logger);
		await delay(DELAY_LOADING_PRODUCT);
	}

	let imageLinks = [];

	// loop through all image elements
	for (const imgElement of imgElements) {
		try {
			const src = await imgElement.getAttribute(imageLinkProperties);
			// check if image is valid
			if (src && IMAGE_ALL_EXT.some((ext) => src.includes(`.${ext}`))) {
				// remove query in url
				const url = transformImageURL(src);
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

const downloadImage = async (product, domain, imageLinks, logger) => {
	const imagesPromise = imageLinks.map(async (imageLink, i) => {
		const fileBuffer = await getFileBufferFromURL(imageLink, logger);
		if (!fileBuffer) {
			return;
		}

		// output/<site name>/<id>_<site_name_with_under_score>.jpg
		let path = `./output/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}`;
		if (FILE_STORAGE_TYPE === 'gcs') {
			path = `${STORAGE_PREFIX}/${domain}/${product._id}_${i}_${domain.replace(/[^a-zA-Z0-9]/g, '_')}`;
		}

		const finalPath = await checkFileTypeByContent(path, fileBuffer);

		const isRemoved = await removeSmallImage(fileBuffer);
		if (isRemoved) {
			return;
		}

		await saveFileFromBuffer(fileBuffer, finalPath);
		if (FILE_STORAGE_TYPE === 'local') {
			return finalPath;
		}
		return `https://storage.googleapis.com/${bucketName}/${finalPath}`;
	});

	const imagesPath = await Promise.all(imagesPromise);
	return imagesPath;
};

export const saveProductData = async (productData, url, logger, crawlId) => {
	const {
		title,
		price,
		description,
		imageLinks,
		metadata,
	} = productData;

	// only domain name
	const domain = new URL(url).hostname;

	// save product data to database
	const product = await productAPI.insertNewProduct({
		title,
		price,
		description,
		url,
		metadata,
		originalImages: imageLinks,
		group: domain,
	});

	// If instance is terminated here, then the image will exist in the database but not in the GCS storage
	// -> not critical
	// recommend to set a flag in the database to indicate whether this function is successful or not
	// set the flag to false by default, and re-set it to true at the end of this function

	// Conclusion - TODO:
	// - add flag to database ensure integrity
	// - add a field "active" as boolean array, will track whether each image is exist or not
	// - check image content to get extension first, then push to GCS storage later, instead of hotfix rename them on GCS
	// - write a script as a scheduled job that will for loop through entire database,
	//   and check each image in "images" exist in GCS storage or not
	//   if not, then re-fetch the image from originalImages and save it to GCS storage
	//   if it cannot be fetched, then deactive the image

	// Insert num of crawled product
	await Crawls.incrNumOfCrawledProduct(crawlId);

	// download image in imageLinks
	const imagePath = await downloadImage(product, domain, imageLinks, logger);
	const originalImages = product.originalImages;

	// find all index of image path that null
	const nullIndex = imagePath.reduce((acc, cur, i) => {
		if (!cur) {
			acc.push(i);
		}
		return acc;
	}, []);

	// remove null image path in both imagePath and product.originalImages
	nullIndex.forEach((index) => {
		imagePath.splice(index, 1);
		originalImages.splice(index, 1);
	});

	if (imagePath.length) {
		// save product image path to database
		await Products.updateProductById(product._id, {
			images: imagePath,
			originalImages,
		});
	} else {
		// remove product if no image
		logger.info('Remove product because no image - ', product._id);
		await Products.deleteProductById(product._id);
	}
};
