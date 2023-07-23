import fs from 'fs';
import readLastLines from 'read-last-lines';

import {
	Server,
} from 'socket.io';

export default function setupLogStreamServer(server) {
	const io = new Server(server, {
		cors: {
			origin: 'http://localhost:3000',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		const watchLogFile = async (crawlId) => {
			const logFilePath = `./logs/crawl-${crawlId}.log`;
			// check if file exists

			let fileData = await readLastLines.read(logFilePath, 1e4);
			socket.emit(`logData-${crawlId}`, {
				data: fileData,
			});

			fs.watch(logFilePath, async (event) => {
				if (event === 'change') {
					fileData = await readLastLines.read(logFilePath, 1e4);
					socket.emit(`logData-${crawlId}`, {
						data: fileData,
					});
				}
			});
		};

		const watchVisitedURLFile = async (crawlId) => {
			const visitedURLFilePath = `./cache/visited-${crawlId}.json`;
			if (!fs.existsSync(visitedURLFilePath)) {
				console.log('File does not exist:', visitedURLFilePath);
				return;
			}

			// Read json file
			let visitedURLs = JSON.parse(fs.readFileSync(visitedURLFilePath, 'utf8'));
			socket.emit(`visitedURLsData-${crawlId}`, {
				visitedURLs: Object.keys(visitedURLs),
			});

			fs.watch(visitedURLFilePath, async (event) => {
				if (event === 'change') {
					// Read json file
					visitedURLs = JSON.parse(fs.readFileSync(visitedURLFilePath, 'utf8'));
					socket.emit(`visitedURLsData-${crawlId}`, {
						visitedURLs: Object.keys(visitedURLs),
					});
				}
			});
		};

		const watchQueueFile = async (crawlId) => {
			const queueFilePath = `./cache/queue-${crawlId}.json`;
			if (!fs.existsSync(queueFilePath)) {
				console.log('File does not exist:', queueFilePath);
				return;
			}

			// Read json file
			let queue = JSON.parse(fs.readFileSync(queueFilePath, 'utf8'));
			socket.emit(`queueData-${crawlId}`, {
				queue,
			});

			fs.watch(queueFilePath, async (event) => {
				if (event === 'change') {
					// Read json file
					queue = JSON.parse(fs.readFileSync(queueFilePath, 'utf8'));
					socket.emit(`queueData-${crawlId}`, {
						queue,
					});
				}
			});
		};

		socket.on('subscribeToLog', async (crawlId) => {
			watchLogFile(crawlId);
			watchVisitedURLFile(crawlId);
			watchQueueFile(crawlId);
		});
	});

	return server;
}
