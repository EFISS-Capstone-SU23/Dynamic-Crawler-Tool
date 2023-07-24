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

			const handleLogFileChange = async () => {
				const fileData = await readLastLines.read(logFilePath, 1e4);
				socket.emit(`logData-${crawlId}`, {
					data: fileData,
				});
			};

			handleLogFileChange();
			// send visited urls to client

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
