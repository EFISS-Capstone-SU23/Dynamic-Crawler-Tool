// eslint-disable-next-line import/no-extraneous-dependencies
import winston from 'winston';

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.json(),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			filename: './app.log',
		}),
	],
});

export default logger;
