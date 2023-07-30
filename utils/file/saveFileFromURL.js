import axios from 'axios';
import fs from 'fs';
import { IMAGE_ALL_EXT } from '../../config/config.js';
import { uploadToGCS } from '../../app/storage/index.js';

const FILE_STORAGE_TYPE = process.env.FILE_STORAGE_TYPE || 'local';

const createParrentDir = (path) => {
	const dir = path.split('/').slice(0, -1).join('/');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true,
		});
	}
};

export const getExtFromUrl = (url) => IMAGE_ALL_EXT.find((ext) => url.includes(`.${ext}`) || 'jpg');

const saveFileToLocal = (fileBuffer, path) => new Promise((resolve, reject) => {
	fs.writeFileSync(path, fileBuffer, (err) => {
		if (err) {
			reject(err);
		}
		resolve();
	});
});

export const saveFileFromURL = async (url, path, logger) => {
	try {
		// createParrentDir(path);
		const response = await axios.get(url, {
			responseType: 'arraybuffer',
			headers: {
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome',
			},
		});

		const fileBuffer = Buffer.from(response.data, 'binary');

		if (FILE_STORAGE_TYPE === 'local') {
			createParrentDir(path);
			// save file to local
			await saveFileToLocal(fileBuffer, path);
		} else if (FILE_STORAGE_TYPE === 'gcs') {
			await uploadToGCS(fileBuffer, path);
		}

		return fileBuffer;
	} catch (error) {
		logger.error(`Failed to download file: ${error.message}`);
		return false;
	}
};

export const saveJsonToFile = (data, path) => {
	const content = JSON.stringify(data, null, 2);
	createParrentDir(path);

	fs.writeFile(path, content, () => {});
};
