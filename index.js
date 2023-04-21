import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const URL = 'https://boo.vn/quan-short-nu-high-waisted-raw-hem-1-2-09-1-04-002-121-23.html';
const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	startUrl: URL,
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	xPath: {
		title: '//*[@id="maincontent"]/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[1]/h1/span',
		price: '/html/body/div[7]/main/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[4]/span[1]/span/span/span',
		description: '//*[@id="accordion"]/div[1]/div/div/div/div',
		imageContainer: '//*[@id="gallery_list"]',
		paginationButton: '',
		metadata: {
			sku: '/html/body/div[7]/main/div[2]/div/div[1]/div[2]/div[1]/div/div[1]/div[2]/div[3]/div',
		},
	},
	ignoreURLs: [
		'https://boo.vn/customer/account/login/referer/.*',
	],
});
