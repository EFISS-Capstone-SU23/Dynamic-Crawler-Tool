import fs from 'fs';
import sharp from 'sharp';
import {
	MIN_HEIGHT,
	MIN_WITH,
} from '../../config/config.js';

export const removeSmallImage = async (imagePath) => {
	// check size of image and remove if it too small
	// imagePath is path to image file
	const {
		width,
		height,
	} = sharp(imagePath).metadata();

	// Check if the image is smaller than 128x128 pixels
	if (width <= MIN_WITH || height <= MIN_HEIGHT) {
		// Delete the file
		fs.unlinkSync(imagePath);
		return true;
	}

	return false;
};
