import { bucket } from '../setupStorage.js';

export default async (fileBuffer, filePath) => new Promise((resolve, reject) => {
	const fileUpload = bucket.file(filePath);

	fileUpload.createWriteStream()
		.on('error', (error) => {
			reject(error);
		})
		.on('finish', () => {
			resolve();
		})
		.end(fileBuffer);
});
