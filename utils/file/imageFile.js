import fs from 'fs';
import sharp from 'sharp';
import { fileTypeFromBuffer } from 'file-type';

import {
	MIN_HEIGHT,
	MIN_WITH,
} from '../../config/config.js';
import { removeFile } from '../../app/storage/index.js';

const FILE_STORAGE_TYPE = process.env.FILE_STORAGE_TYPE || 'local';

export const removeSmallImage = async (fileBuffer, filePath) => {
	// check size of image and remove if it too small
	// imagePath is path to image file
	const {
		width,
		height,
	} = await sharp(fileBuffer).metadata();

	// Check if the image is smaller than 128x128 pixels
	if (width <= MIN_WITH || height <= MIN_HEIGHT) {
		// Delete the file
		if (FILE_STORAGE_TYPE === 'local') {
			fs.unlinkSync(filePath);
		} else if (FILE_STORAGE_TYPE === 'gcs') {
			await removeFile(filePath);
		}

		return true;
	}

	return false;
};

export const checkFileTypeByContent = (filePath) => {
	fs.readFile(filePath, async (err, data) => {
		const fileInfo = await fileTypeFromBuffer(data);
		const currentExt = filePath.split('.').pop();
		if (fileInfo && fileInfo.ext !== currentExt) {
			const newFilePath = filePath.replace(currentExt, fileInfo.ext);
			fs.renameSync(filePath, newFilePath);
		}
	});
};
