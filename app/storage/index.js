import {
	storage,
	bucket,
} from './setupStorage.js';
import uploadToGCS from './utils/uploadToGCS.js';
import removeFile from './utils/removeFile.js';

export {
	storage,
	bucket,
	uploadToGCS,
	removeFile,
};
