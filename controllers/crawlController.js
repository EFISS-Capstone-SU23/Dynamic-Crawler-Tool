import Crawls from '../models/Crawls.js';
import Templates from '../models/Templates.js';

const findCrawlList = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const pageSize = parseInt(req.query.pageSize, 10) || 20;

	const {
		query,
	} = req.body;

	const searchQuery = {};
	if (query.website) {
		// query all website that contains the query.website
		searchQuery['templateData.website'] = {
			$regex: query.website,
			$options: 'i',
		};
	}

	const data = await Crawls.findCrawlList(page, pageSize, searchQuery);
	const total = await Crawls.countTemplatesByQuery(searchQuery);

	res.json({
		data,
		total,
		page,
		hasNext: (page + 1) * pageSize < total,
	});
};

const upsertCrawl = async (req, res) => {
	const {
		_id,
		templateId,
		maxInstances = 1,
		ignoreUrlPatterns = [],
		status,
	} = req.body;

	if (!_id) {
		// Create new crawl
		const templateData = await Templates.findOneById(templateId);
		if (!templateData) {
			res.status(400).json({
				error: 'Template not found',
			});
			return;
		}

		const crawl = {
			templateData,
			// TODO: add runBy
			runBy: 'admin',
			status,
			maxInstances,
			ignoreUrlPatterns,
		};

		console.log(crawl);

		await Crawls.insertNewCrawl(crawl);

		// TODO: start crawl

		res.json({
			success: true,
		});
	} else {
		// Update crawl
		const update = {
			maxInstances,
			ignoreUrlPatterns,
		};

		await Crawls.updateCrawlById(_id, update);

		res.json({
			success: true,
		});
	}
};

export default {
	findCrawlList,
	upsertCrawl,
};
