import {
	Builder,
} from 'selenium-webdriver';
// set chrome options
import chrome from 'selenium-webdriver/chrome.js';
import optimist from 'optimist';

const NO_HEADLESS = 'no-headless' in optimist.argv;

const o = new chrome.Options();
// o.addArguments('start-fullscreen');
o.addArguments('disable-infobars');
o.addArguments('start-maximized');

if (!NO_HEADLESS) {
	o.addArguments('headless'); // running test on visual chrome browser
}

// Add Chrome user agent
o.addArguments('--user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome');

o.setUserPreferences({
	credential_enable_service: false,
});

export const getDriver = () => new Builder()
	.forBrowser('chrome')
	.setChromeOptions(o)
	.build();
