import fs from 'fs';
import readLastLines from 'read-last-lines';
import {
	Server,
} from 'socket.io';

export let streamSocket;
export function setupLogStream(server) {
	const io = new Server(server, {
		cors: {
			origin: 'http://localhost:3000',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		streamSocket = socket;
		const watchLogFile = async (crawlId) => {
			const logFilePath = `./logs/crawl-${crawlId}.log`;
			const visitedURLPath = `./cache/visited-${crawlId}.json`;
			const queuePath = `./cache/queue-${crawlId}.json`;

			const handleLogFileChange = async () => {
				const logData = await readLastLines.read(logFilePath, 1e4);
				socket.emit(`logData-${crawlId}`, {
					data: logData,
				});
			};

			handleLogFileChange();
			// send visited urls to client if file exists
			if (fs.existsSync(visitedURLPath)) {
				const visitedURLs = JSON.parse(fs.readFileSync(visitedURLPath));
				socket.emit(`visitedURLsData-${crawlId}`, {
					visitedURLs,
				});
			}

			// send queue to client if file exists
			if (fs.existsSync(queuePath)) {
				const queue = JSON.parse(fs.readFileSync(queuePath));
				socket.emit(`queueData-${crawlId}`, {
					queue,
				});
			}

			fs.watch(logFilePath, async (event) => {
				if (event === 'change') {
					handleLogFileChange();
				}
			});
		};

		socket.on('subscribeToLog', async (crawlId) => {
			watchLogFile(crawlId);
		});
	});

	return server;
}
