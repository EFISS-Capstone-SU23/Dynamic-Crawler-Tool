import express from 'express';

import { SERVER_PORT } from './config/config';

import templateRouter from './routes/templateRoute';

const app = express();

// setup body parser
app.use(express.json());

app.use('/template', templateRouter);

app.listen(SERVER_PORT, () => {
	console.log(`Server is listening on port ${SERVER_PORT}`);
});
