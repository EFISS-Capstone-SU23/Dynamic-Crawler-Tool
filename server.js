import express from 'express';
import cors from 'cors';

import './config/env.js';
import './config/mongoose.js';
import { SERVER_PORT } from './config/config.js';

import templateRouter from './routes/templateRoute.js';
import crawRouter from './routes/crawlRoute.js';

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

app.listen(SERVER_PORT, () => {
	console.log(`Server is listening on port ${SERVER_PORT}`);
});
