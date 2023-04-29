import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://www2.hm.com/vi_vn/',
	xPath: {
		title: '//*[@id="js-product-name"]/div/h1',
		price: '//*[@id="product-price"]/div/span',
		description: '//*[@id="js-product-description"]/div',
		imageContainer: '//*[@id="main-content"]/div[1]/div[2]/div[1]',
		paginationButton: '//*[@id="page-content"]/div/div[3]/div[2]/button',
		imageElement: '//img',
		imageLinkProperties: 'src',
		metadata: {
			color: '//*[@id="main-content"]/div[1]/div[2]/div[1]/div[1]/div/div[1]/h3',
		},
	},
	ignoreURLs: [
		'https://www2.hm.com/((?!vi_vn).*)/.*$',
	],
});
