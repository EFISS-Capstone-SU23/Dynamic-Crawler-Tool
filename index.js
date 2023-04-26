import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://www.uniqlo.com/vn/vi/',
	xPath: {
		title: '//*[@id="right"]/div[1]/div/div[1]/h1',
		price: '//*[@id="right"]/div[1]/div/div[2]/div[1]/div/div/div/span',
		description: '//*[@id="right"]/div[1]/div/div[3]/div',
		imageContainer: '//*[@id="left"]/div',
		paginationButton: '//*[@id="root"]/div/div/div/div/main/div/div[2]/div/div/div/section[2]/div/div/div[2]/div[1]/a',
		metadata: {
			color: '/html/body/div[1]/div/div/div/div/main/div/div[2]/div/div/div/div/div[2]/div/div[1]/div[2]/div[2]/div[1]/div[1]/div/h7',
		},
	},
	ignoreURLs: [
		'https://www.uniqlo.com/((?!vn)[a-z]{2})/.*$',
	],
	imageLinkProperties: 'src',
});
