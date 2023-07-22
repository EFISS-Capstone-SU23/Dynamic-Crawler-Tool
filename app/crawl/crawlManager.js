import Crawls from '../../models/Crawls.js';
import extractAll from '../extract-all-link/extractAll.js';

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

	extractAll(crawlParams);
};
