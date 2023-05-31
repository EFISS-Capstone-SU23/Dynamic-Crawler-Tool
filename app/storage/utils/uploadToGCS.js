import { bucket } from '../setupStorage.js';

export default async (fileBuffer, filePath) => {
	const fileUpload = bucket.file(filePath);
	return fileUpload.save(fileBuffer);
};
