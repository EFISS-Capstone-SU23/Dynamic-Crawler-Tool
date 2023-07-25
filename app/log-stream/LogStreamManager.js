import { streamSocket } from './setup.js';

const LogStreamManager = {
	emitVisitedURLs(visitedURLs, crawlId) {
		streamSocket.emit(`visitedURLsData-${crawlId}`, {
			visitedURLs,
		});
	},
	emitQueue(queue, crawlId) {
		streamSocket.emit(`queueData-${crawlId}`, {
			queue,
		});
	},
	emitLogData(logData, crawlId) {
		streamSocket.emit(`logData-${crawlId}`, {
			data: logData,
		});
	},
	emitNumOfCrawledProduct(numOfCrawledProduct, crawlId) {
		streamSocket.emit(`numOfCrawledProduct-${crawlId}`, {
			numOfCrawledProduct,
		});
	},
};

export default LogStreamManager;
