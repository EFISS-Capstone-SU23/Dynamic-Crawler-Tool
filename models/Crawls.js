import mongoose from 'mongoose';
// eslint-disable-next-line import/no-cycle
import LogStreamManager from '../app/log-stream/LogStreamManager.js';

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
	numOfCrawledImage: {
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
	queue: {
		type: Array,
		default: [],
	},
	visitedUrls: {
		type: Object,
		default: {},
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
	updateStatus(_id, status) {
		return _db.updateOne({
			_id,
		}, {
			$set: {
				status,
			},
		});
	},
	insertNewCrawl: async (crawl) => _db.create(crawl),
	updateCrawlById(_id, update) {
		return _db.updateOne({
			_id,
		}, {
			$set: update,
		});
	},
	setEndTime(_id) {
		return _db.updateOne({
			_id,
		}, {
			$set: {
				endTime: new Date(),
			},
		});
	},
	async incrNumOfCrawledProduct(_id) {
		await _db.updateOne({
			_id,
		}, {
			$inc: {
				numOfCrawledProduct: 1,
			},
		});

		// stream to client
		const crawl = await this.findOneById(_id);
		const numOfCrawledProduct = crawl.numOfCrawledProduct || 0;

		LogStreamManager.emitNumOfCrawledProduct(numOfCrawledProduct, _id);
		return numOfCrawledProduct;
	},
	async incrNumOfCrawledImage(_id, numberOfImages) {
		await _db.updateOne({
			_id,
		}, {
			$inc: {
				numOfCrawledImage: numberOfImages,
			},
		});

		// stream to client
		const crawl = await this.findOneById(_id);
		const numOfCrawledImage = crawl.numOfCrawledImage || 0;

		LogStreamManager.emitNumOfCrawledImage(numOfCrawledImage, _id);
		return numOfCrawledImage;
	},
};

export default Crawls;
