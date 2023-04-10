import {
	Builder,
} from 'selenium-webdriver';

// set chrome options
import chrome from 'selenium-webdriver/chrome.js';

const o = new chrome.Options();

// o.addArguments('start-fullscreen');
o.addArguments('disable-infobars');
o.addArguments('start-maximized');
// o.addArguments('headless'); // running test on visual chrome browser

o.setUserPreferences({
	credential_enable_service: false,
});

export const getDriver = () => new Builder()
	.forBrowser('chrome')
	.setChromeOptions(o)
	.build();
