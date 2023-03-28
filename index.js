import {
	Builder,
	By,
	until,
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

let driver = new Builder()
	.forBrowser('chrome')
	.setChromeOptions(o)
	.build();

driver.get('https://www.google.com');

// search for selenium
driver.findElement(By.name('q')).sendKeys('selenium');
driver.findElement(By.name('btnK')).click();

// wait for the results to appear
driver.wait(until.elementLocated(By.id('resultStats')), 10000);


