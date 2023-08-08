// eslint-disable-next-line import/no-cycle
import { streamSocket } from './setup.js';

const LogStreamManager = {
	emitVisitedURLs(visitedURLs, crawlId) {
		if (!streamSocket) {
			return;
		}

		streamSocket.emit(`visitedURLsData-${crawlId}`, {
			visitedURLs,
		});
	},
	emitQueue(queue, crawlId) {
		if (!streamSocket) {
			return;
		}
		streamSocket.emit(`queueData-${crawlId}`, {
			queue,
		});
	},
	emitLogData(logData, crawlId) {
		if (!streamSocket) {
			return;
		}
		streamSocket.emit(`logData-${crawlId}`, {
			data: logData,
		});
	},
	emitNumOfCrawledProduct(numOfCrawledProduct, crawlId) {
		if (!streamSocket) {
			return;
		}
		streamSocket.emit(`numOfCrawledProduct-${crawlId}`, {
			numOfCrawledProduct,
		});
	},
	emitNumOfCrawledImage(numOfCrawledImage, crawlId) {
		if (!streamSocket) {
			return;
		}
		streamSocket.emit(`numOfCrawledImage-${crawlId}`, {
			numOfCrawledImage,
		});
	},
};

export default LogStreamManager;
