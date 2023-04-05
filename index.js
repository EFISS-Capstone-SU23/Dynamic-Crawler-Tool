// import { By } from 'selenium-webdriver';

import extractAll from './app/extract-all-link/extractAll.js';

const URL = 'https://www.uniqlo.com/vn/vi/';
const MAX_INSTANCE = 1;

extractAll(URL, MAX_INSTANCE);
// driver.get(URL);

// const visitedURL = {};
// visitedURL[URL] = true;

// // get all link in a tag of website
// driver.findElements(By.css('a')).then((links) => {
// 	links.forEach((link) => {
// 		link.getAttribute('href').then((href) => {
// 			console.log(href);
// 		});
// 	});
// });
