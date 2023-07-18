import mongoose from 'mongoose';

const TemplateSchema = new mongoose.Schema({
	website: {
		type: String,
		required: true,
		index: true,
	},
	startUrl: {
		type: String,
		required: true,
	},
	templateData: {
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
	async findTemplateList(page = 0, pageSize = 20, query = {}) {
		const skip = page * pageSize;

		const searchQuery = {};
		if (query.website) {
			// TODO: handle query.website here
		}

		const sort = {
			createdAt: -1,
		};
		const projection = {
			_id: -1,
			templateData: -1,
		};

		const data = await _db.find(searchQuery, projection, {
			skip,
			limit: pageSize,
			sort,
		});

		const total = this.countAllTemplates();

		return {
			data,
			total,
			page,
			hasNext: (page + 1) * pageSize < total,
		};
	},
};

export default Templates;
