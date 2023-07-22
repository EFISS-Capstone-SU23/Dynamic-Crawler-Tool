import Crawls from '../../models/Crawls.js';

export const startCrawl = async (crawlId) => {
	const crawl = await Crawls.findOneById(crawlId);
	if (!crawl) {
		return;
	}

	const {
		templateData,
		ignoreUrlPatterns,
		numInstance,
	} = crawl;

	const crawlParams = {
		numInstance,
		continueExtract: false,
		...templateData,
		ignoreUrlPatterns,
	};

	console.log(crawlParams);
};
