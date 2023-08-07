import fs from 'fs';
import readLastLines from 'read-last-lines';
import {
	Server,
} from 'socket.io';

export let streamSocket;
export function setupLogStream(server) {
	const io = new Server(server, {
		cors: {
			origin: '*',
			methods: ['GET', 'POST'],
		},
	});

	io.on('connection', (socket) => {
		streamSocket = socket;
		const watchLogFile = async (crawlId) => {
			const logFilePath = `./logs/crawl-${crawlId}.log`;

			const handleLogFileChange = async () => {
				const logData = await readLastLines.read(logFilePath, 1e3);
				socket.emit(`logData-${crawlId}`, {
					data: logData,
				});
			};

			handleLogFileChange();

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
