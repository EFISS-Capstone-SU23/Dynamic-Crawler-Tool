import axios from 'axios';
import fs from 'fs';

import logger from '../../config/log.js';

const createParrentDir = (path) => {
	const dir = path.split('/').slice(0, -1).join('/');
	if (!fs.existsSync(dir)) {
		fs.mkdirSync(dir, {
			recursive: true,
		});
	}
};

export const getExtFromUrl = (url) => {
	// remove all query string
	const urlWithoutQueryString = url.split('?')[0];
	// get ext from url
	return urlWithoutQueryString.split('.').pop();
};

export const saveFileFromURL = async (url, path) => {
	try {
		createParrentDir(path);
		const response = await axios.get(url, {
			responseType: 'stream',
			headers: {
				'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome',
			},
		});

		const writer = fs.createWriteStream(path);
		response.data.pipe(writer);

		return new Promise((resolve, reject) => {
			writer.on('finish', resolve);
			writer.on('error', reject);
		});
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
