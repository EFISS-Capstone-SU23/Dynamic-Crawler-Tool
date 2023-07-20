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
	insertNewTemplate: async (template) => _db.create(template),
	countAllTemplates: async () => _db.countDocuments(),
	findTemplateList(page = 1, pageSize = 20, query = {}) {
		const skip = (page - 1) * pageSize;

		const searchQuery = {};
		if (query.website) {
			// TODO: handle query.website here
		}

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
	deleteById: async (id) => _db.findByIdAndDelete(id),
};

export default Templates;
