import fs from 'fs';
import readLastLines from 'read-last-lines';

// Socket.io
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
		console.log('Client connected to log stream');

		// Function to send log data to the client
		function sendLogData(crawlId, data) {
			socket.emit(`logData-${crawlId}`, {
				data,
			});
		}

		const handleFileChange = async (logFilePath, crawlId) => {
			const fileData = await readLastLines.read(logFilePath, 100);
			sendLogData(crawlId, fileData);
		};

		socket.on('subscribeToLog', (crawlId) => {
			if (crawlId) {
				const logFilePath = `./logs/crawl-${crawlId}.log`;
				handleFileChange(logFilePath, crawlId);

				fs.watch(logFilePath, (event) => {
					if (event === 'change') {
						handleFileChange(logFilePath, crawlId);
					}
				});
			} else {
				console.log('Invalid log ID:', crawlId);
			}
		});
	});

	return server;
}
