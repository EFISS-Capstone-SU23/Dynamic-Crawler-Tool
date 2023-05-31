import { bucket } from '../setupStorage.js';

export default function removeFile(path) {
	return bucket.file(path).delete();
}
