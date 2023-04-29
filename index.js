import './config/mongoose.js';
import optimist from 'optimist';

import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = optimist.argv['max-instance'] || 1;
const CONTINUE = 'continue' in optimist.argv;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://highwaymenswear.com/so-mi-cuban-dusty-brown-regular-fit-nau-p40682376.html',
	xPath: {
		title: '//*[@id="detail-product"]/div/div/div[1]/h1',
		price: '//*[@id="price-preview"]/span/span',
		description: '//*[@id="detail-product"]/div/div/div[6]/div[1]/div',
		imageContainer: '//*[@id="product false"]/div/div[2]/div/div[1]/div[1]/div/div[2]',
		paginationButton: '',
		imageElement: '//img',
		imageLinkProperties: 'src',
		metadata: {},
	},
	ignoreURLs: [],
});
