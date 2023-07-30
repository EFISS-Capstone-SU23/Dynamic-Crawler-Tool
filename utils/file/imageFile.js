import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

import {
	MIN_HEIGHT,
	MIN_WITH,
} from '../../config/config.js';

export const removeSmallImage = async (fileBuffer) => {
	// check size of image and remove if it too small
	// imagePath is path to image file
	const {
		width,
		height,
	} = await sharp(fileBuffer).metadata();

	// Check if the image is smaller than 128x128 pixels
	if (width <= MIN_WITH || height <= MIN_HEIGHT) {
		return true;
	}

	return false;
};

export const checkFileTypeByContent = async (filePath, fileBuffer) => {
	const fileInfo = await fileTypeFromBuffer(fileBuffer);

	const newFilePath = `${filePath}.${fileInfo.ext}`;
	return newFilePath;
};
