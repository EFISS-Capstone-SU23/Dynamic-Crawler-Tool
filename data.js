const data = [{
	startUrl: 'https://boo.vn/',
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
	imageLinkProperties: 'data-original',
}, {
	startUrl: 'https://candles.vn/',
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
}];

export default data;
