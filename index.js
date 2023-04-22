import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://candles.vn/tshirt-pc358107.html',
	xPath: {
		title: '//*[@id="wrapper"]/div[1]/div/div[1]/div[2]/div[1]/h1',
		price: '//*[@id="wrapper"]/div[1]/div/div[1]/div[2]/div[1]/p[2]/span',
		description: '/html/body/div[1]/div[1]/div/div[1]/div[2]/div[4]/div/p[1]',
		imageContainer: '//*[@id="wrapper"]/div[1]/div/div[1]/div[1]/div[2]/div/div/div',
		paginationButton: '',
		metadata: {},
	},
	ignoreURLs: [],
	imageLinkProperties: 'src',
});
