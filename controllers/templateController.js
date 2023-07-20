import Templates from '../models/Templates.js';

const findTemplateList = async (req, res) => {
	const page = parseInt(req.query.page, 10) || 1;
	const pageSize = parseInt(req.query.pageSize, 10) || 20;

	const {
		query,
	} = req.body;

	const data = await Templates.findTemplateList(page, pageSize, query);
	const total = await Templates.countAllTemplates();

	res.json({
		data,
		total,
		page,
		hasNext: (page + 1) * pageSize < total,
	});
};

const upsertTemplate = async (req, res) => {
	const {
		template,
	} = req.body;

	// check if website exist
	const website = new URL(template.startUrl).hostname;
	const websiteExist = await Templates.findOneByWebsite(website);

	if (!template._id) {
		// create new template
		if (websiteExist) {
			res.status(400).json({
				message: 'Website already exist',
			});
			return;
		}

		// TODO: set addedBy to current user
		const addedBy = 'admin';

		const templateData = {
			addedBy,
			template,
			website,
		};
		const data = await Templates.insertNewTemplate(templateData);

		res.json({
			type: 'create',
			data,
		});
	} else {
		// update template
		if (websiteExist && websiteExist._id.toString() !== template._id) {
			res.status(400).json({
				message: 'Website already exist',
			});

			return;
		}

		const templateData = {
			template,
			website,
		};

		const data = await Templates.updateTemplateById(template._id, templateData);

		res.json({
			type: 'update',
			data,
		});
	}
};

const deleteTempleteByID = async (req, res) => {
	const {
		id,
	} = req.params;

	const response = await Templates.deleteById(id);
	res.json({
		response,
	});
};

const getTemplateByID = async (req, res) => {
	const {
		id,
	} = req.params;

	const template = await Templates.findOneById(id);

	if (!template) {
		res.status(404).json({
			message: 'Template not found',
		});
		return;
	}

	res.json({
		template,
	});
};

export default {
	findTemplateList,
	upsertTemplate,
	deleteTempleteByID,
	getTemplateByID,
};
