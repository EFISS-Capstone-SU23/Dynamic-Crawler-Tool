// eslint-disable-next-line import/no-extraneous-dependencies
import winston from 'winston';

import {
	TEMPLATE,
} from './parram.js';

const customFormat = winston.format.printf(({
	level,
	message,
	timestamp,
}) => `${timestamp} - ${level.toUpperCase()} - ${message}`);

const logger = winston.createLogger({
	level: 'info',
	format: winston.format.combine(
		winston.format.timestamp(),
		customFormat,
	),
	transports: [
		new winston.transports.Console(),
		new winston.transports.File({
			// add time stamp to log file name
			filename: `./logs/extract-${TEMPLATE}-${new Date().toISOString().replace(/:/g, '-')}.log`,
		}),
	],
});

export default logger;
