import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const MAX_INSTANCE = 1;
const CONTINUE = false;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll({
	maxDriver: MAX_INSTANCE,
	continueExtract: CONTINUE,
	startUrl: 'https://nellytaobao.vn/ao-phong-make-it-rain-heybig-ngan-tay-advance',
	xPath: {
		title: '/html/body/section[2]/div[2]/div/div[1]/div/div[1]/div[2]/h1',
		price: '/html/body/section[2]/div[2]/div/div[1]/div/div[1]/div[2]/div[3]/span[2]/span',
		description: '/html/body/section[2]/div[2]/div/div[1]/div/div[1]/div[2]/div[4]/div',
		imageContainer: '//*[@id="gallery_01"]/div/div',
		paginationButton: '/html/body/div[4]/div/section/div[2]/div[2]/nav/ul/li[last()]/a',
		imageElement: '//a',
		imageLinkProperties: 'data-image',
		metadata: {},
	},
	ignoreURLs: [],
});
