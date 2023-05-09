import './config/mongoose.js';

import optimist from 'optimist';
import fs from 'fs';

import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = optimist.argv['max-instance'] || 1;
const CONTINUE = 'continue' in optimist.argv;
const TEMPLATE = optimist.argv.template;

process.setMaxListeners(MAX_INSTANCE + 5);

const validateTemplate = (template) => {
	const {
		xPath,
		startUrl,
	} = template;

	if (!xPath) {
		console.error('Template must have xPath');
		process.exit(1);
	}

	if (!startUrl) {
		console.error('Template must have startUrl');
		process.exit(1);
	}

	const xPathRequire = [
		'title',
		'price',
		'description',
		'imageContainer',
	];

	xPathRequire.forEach((key) => {
		if (!xPath[key]) {
			console.error(`Template must have xPath.${key}`);
			process.exit(1);
		}
	});
};

// if have template flag and have template file
let templateData = {};
if (TEMPLATE) {
	const templatePath = `./templates/${TEMPLATE}.json`;
	if (fs.existsSync(templatePath)) {
		templateData = JSON.parse(fs.readFileSync(templatePath, 'utf8'));
		validateTemplate(templateData);
	} else {
		console.error(`Template ${TEMPLATE} not found`);
		process.exit(1);
	}
} else {
	console.error('Please provide template name');
	process.exit(1);
}

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	...templateData,
});
