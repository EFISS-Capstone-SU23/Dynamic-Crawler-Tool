export default (url) => {
	// remove query string
	let transfromedURL = url.split('?')[0];
	// remove hash
	transfromedURL = transfromedURL.split('#')[0];

	return transfromedURL;
};
