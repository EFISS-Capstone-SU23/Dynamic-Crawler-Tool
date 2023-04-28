import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://www.zara.com/vn/vi/',
	xPath: {
		title: '//*[@id="main"]/article/div/div[1]/div[2]/div[1]/div[1]/h1',
		price: '//*[@id="main"]/article/div/div[1]/div[2]/div[1]/div[2]/div/span/span/span/div/span',
		description: '//*[@id="main"]/article/div/div[1]/div[2]/div[1]/div[3]/div/div/div/p',
		imageContainer: '//*[@id="main"]/article/div/div[1]/div[1]/section/ul',
		paginationButton: '',
		metadata: {
			color: '//*[@id="main"]/article/div/div[1]/div[2]/div[1]/p',
		},
	},
	ignoreURLs: [
		'https://www.zara.com/((?!vn)[a-z]{2})/.*$',
		'https://www.zara.com/vn/((?!vi)[a-z]{2})/.*$',
	],
	imageLinkProperties: 'src',
});
