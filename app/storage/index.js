import {
	storage,
	bucket,
	bucketName,
} from './setupStorage.js';
import uploadToGCS from './utils/uploadToGCS.js';
import removeFile from './utils/removeFile.js';

export {
	storage,
	bucket,
	bucketName,
	uploadToGCS,
	removeFile,
};
