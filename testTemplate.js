import './config/env.js';
import './config/mongoose.js';

import optimist from 'optimist';
import {
	Builder,
} from 'selenium-webdriver';
// set chrome options
import chrome from 'selenium-webdriver/chrome.js';

import Templates from './models/Templates.js';

const main = async () => {
	const TEMPLATE_NAME = optimist.argv.template;
	console.log('TEMPLATE_NAME:', TEMPLATE_NAME);

	// setup chrome driver
	const o = new chrome.Options();
	o.addArguments('disable-infobars');
	o.addArguments('start-maximized');
	o.addArguments('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome');
	o.setUserPreferences({
		credential_enable_service: false,
	});

	const driver = await new Builder()
		.forBrowser('chrome')
		.setChromeOptions(o)
		.build();

	// get template
	const templateData = await Templates.findOneByWebsite(TEMPLATE_NAME);
	if (!templateData) {
		console.error('Template not found');
		process.exit(1);
	}

	// get start url
	const {
		startUrl,
	} = templateData;

	// go to start url
	await driver.get(startUrl);
};

main();
