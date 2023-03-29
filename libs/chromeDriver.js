import {
	Builder,
} from 'selenium-webdriver';

// set chrome options
import chrome from 'selenium-webdriver/chrome.js';

let o = new chrome.Options();

// o.addArguments('start-fullscreen');
o.addArguments('disable-infobars');
// o.addArguments('headless'); // running test on visual chrome browser
o.setUserPreferences({ credential_enable_service: false });

// open google
o.addArguments('start-maximized');

const driver = new Builder()
	.forBrowser('chrome')
	.setChromeOptions(o)
	.build();

export default driver;
