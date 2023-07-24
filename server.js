import express from 'express';
import cors from 'cors';
import http from 'http';

import './config/env.js';
import './config/mongoose.js';
import { SERVER_PORT } from './config/config.js';

import templateRouter from './routes/templateRoute.js';
import crawRouter from './routes/crawlRoute.js';

import { setupLogStream } from './app/log-stream/setup.js';

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

server.listen(SERVER_PORT, () => {
	console.log(`Server is listening on port ${SERVER_PORT}`);
});
