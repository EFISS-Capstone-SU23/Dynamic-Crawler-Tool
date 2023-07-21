import Crawls from '../models/Crawls.js';

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

export default {
	findCrawlList,
};
