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

export default async function saveFileFromURL(url, path) {
	try {
		createParrentDir(path);
		const response = await axios.get(url, {
			responseType: 'stream',
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
}

export const saveJsonToFile = (data, path) => {
	const content = JSON.stringify(data, null, 2);
	createParrentDir(path);

	fs.writeFile(path, content, () => {});
};
