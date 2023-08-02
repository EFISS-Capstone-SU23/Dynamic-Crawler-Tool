import Crawls from '../models/Crawls.js';
import Templates from '../models/Templates.js';
import { startCrawl, resumeCrawl } from '../app/crawl/crawlManager.js';

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

	if (query.status && query.status !== 'all') {
		searchQuery.status = query.status;
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
		numInstance = 1,
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
			templateData: templateData.template,
			website: templateData.website,
			// TODO: add runBy
			runBy: 'admin',
			status,
			numInstance,
			ignoreUrlPatterns,
		};
		const crawlInserted = await Crawls.insertNewCrawl(crawl);

		// update info in template
		await Templates.startNewCrawlWithTemplate(templateId);

		// TODO: start crawl
		startCrawl(crawlInserted._id);

		res.json({
			success: true,
		});
	} else {
		// Update crawl
		const crawl = await Crawls.findOneById(_id);
		if (!crawl) {
			res.status(400).json({
				error: 'Crawl not found',
			});
			return;
		}

		const update = {
			numInstance,
			ignoreUrlPatterns,
		};

		// check if change status
		if (status && status !== crawl.status) {
			update.status = status;
			if (status === 'stopped') {
				update.endTime = new Date();
			}
		}

		await Crawls.updateCrawlById(_id, update);

		if (status && status !== crawl.status) {
			switch (status) {
			case 'running':
				resumeCrawl(_id);
				break;
			case 'stopped':
				break;
			case 'paused':
				break;
			default:
				break;
			}
		}

		res.json({
			success: true,
		});
	}
};

const findCrawlById = async (req, res) => {
	const {
		id,
	} = req.params;

	const crawl = await Crawls.findOneById(id);
	if (!crawl) {
		res.status(400).json({
			error: 'Crawl not found',
		});
		return;
	}
	res.json({
		crawl,
	});
};

export default {
	findCrawlList,
	upsertCrawl,
	findCrawlById,
};
