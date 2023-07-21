import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
	website: {
		type: String,
		required: true,
		index: true,
	},
	template: {
		type: Object,
		required: true,
	},
	addedBy: {
		type: String,
		required: true,
	},
	lastCrawl: {
		type: Date,
	},
	numOfCrawls: {
		type: Number,
		required: true,
		default: 0,
	},
}, {
	timestamps: true,
});

const _db = mongoose.model('Template', TemplateSchema);

const Templates = {
	_db,
	insertNewTemplate: async (template) => _db.create(template),
	countAllTemplates: async () => _db.countDocuments(),
	countTemplatesByQuery: async (query = {}) => _db.countDocuments(query),
	findTemplateList(page = 1, pageSize = 20, searchQuery = {}) {
		const skip = (page - 1) * pageSize;

		const sort = {
			createdAt: -1,
		};
		const projection = {
			template: 0,
		};

		return _db.find(searchQuery, projection, {
			skip,
			limit: pageSize,
			sort,
		});
	},
	findOneByWebsite: async (website) => _db.findOne({
		website,
	}),
	findOneById: async (id) => {
		try {
			const template = await _db.findById(id);
			return template;
		} catch (err) {
			return null;
		}
	},
	deleteById: async (id) => _db.findByIdAndDelete(id),
	updateTemplateById: async (id, update) => _db.updateOne({
		_id: id,
	}, {
		$set: update,
	}),
};

export default Templates;
