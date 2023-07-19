import Templates from '../models/Templates.js';

const findTemplateList = async (req, res) => {
	const {
		page = 0,
		pageSize = 20,
		query = {},
	} = req.body;

	const data = await Templates.findTemplateList(page, pageSize, query);
	const total = Templates.countAllTemplates();

	res.json({
		data,
		total,
		page,
		hasNext: (page + 1) * pageSize < total,
	});
};

const insertNewTemplate = async (req, res) => {
	const {
		website,
		startUrl,
		templateData,
		addedBy,
	} = req.body;

	const template = {
		website,
		startUrl,
		templateData,
		addedBy,
	};

	const data = await Templates.insertNewTemplate(template);
	res.json({
		data,
	});
};

export default {
	findTemplateList,
	insertNewTemplate,
};
