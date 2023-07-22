import mongoose from 'mongoose';

const CrawlSchema = new mongoose.Schema({
	templateData: {
		type: Object,
		required: true,
	},
	website: {
		type: String,
		required: true,
	},
	numOfCrawledProduct: {
		type: Number,
		default: 0,
	},
	ignoreUrlPatterns: {
		type: Array,
		required: true,
	},
	runBy: {
		type: String,
		required: true,
	},
	status: {
		type: String,
		required: true,
	},
	numInstance: {
		type: Number,
		required: true,
	},
	endTime: {
		type: Date,
	},
	logFile: {
		type: Object,
	},
}, {
	timestamps: true,
});

const _db = mongoose.model('Crawl', CrawlSchema);

const Crawls = {
	_db,
	countTemplatesByQuery: async (query = {}) => _db.countDocuments(query),
	findCrawlList(page = 1, pageSize = 20, searchQuery = {}) {
		const skip = (page - 1) * pageSize;

		const sort = {
			createdAt: -1,
		};
		const projection = {};

		return _db.find(searchQuery, projection, {
			skip,
			limit: pageSize,
			sort,
		});
	},
	findOneById: async (id) => {
		try {
			const crawl = await _db.findById(id);
			return crawl;
		} catch (err) {
			return null;
		}
	},
	insertNewCrawl: async (crawl) => _db.create(crawl),
	updateCrawlById(_id, update) {
		return _db.updateOne({
			_id,
		}, {
			$set: update,
		});
	},
};

export default Crawls;
