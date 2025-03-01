/* eslint-disable no-promise-executor-return */
import express from 'express';
import cors from 'cors';
import http from 'http';

import './config/env.js';
import './config/mongoose.js';
import { SERVER_PORT } from './config/config.js';

import templateRouter from './routes/templateRoute.js';
import crawRouter from './routes/crawlRoute.js';

import { setupLogStream } from './app/log-stream/setup.js';
import Crawls from './models/Crawls.js';
import { resumeCrawl } from './app/crawl/crawlManager.js';

const app = express();

// setup body parser
app.use(express.json());

// setup cors
app.use(cors({
	origin: '*',
	methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

app.use('/template', templateRouter);
app.use('/crawl', crawRouter);

const server = http.createServer(app);
setupLogStream(server);

server.listen(SERVER_PORT, async () => {
	console.log(`Server is listening on port ${SERVER_PORT}`);

	if (process.env.AUTO_RESTART_CRAWLS) {
		// delay 5s
		await new Promise((resolve) => setTimeout(resolve, 5 * 1000));

		// get all running crawls and start them
		const crawls = await Crawls.findByStatus('running');
		crawls.forEach((crawl) => {
			console.log(`Resume crawl ${crawl._id}`);
			resumeCrawl(crawl._id);
		});
	}
});

// Increase max listeners
process.setMaxListeners(100);
