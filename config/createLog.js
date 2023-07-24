import winston from 'winston';

export default function createLog(crawlId) {
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
			// new winston.transports.Console(),
			new winston.transports.File({
			// add time stamp to log file name
				filename: `./logs/crawl-${crawlId}.log`,
			}),
		],
	});

	return logger;
}
