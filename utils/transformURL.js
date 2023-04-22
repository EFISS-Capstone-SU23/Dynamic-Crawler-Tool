export default (url, domain) => {
	// get all query of url as object
	const urlObject = new URL(url);
	const urlSearchParams = new URLSearchParams(urlObject.search);
	const urlQuery = Object.fromEntries(urlSearchParams.entries());

	// remove query string
	let transfromedURL = url.split('?')[0];

	// remove hash
	transfromedURL = transfromedURL.split('#')[0];

	// if url start with / then add domain and protocol
	transfromedURL = transfromedURL.startsWith('/') ? `https://${domain}${transfromedURL}` : transfromedURL;

	// if urlQuery contain page then add it back to url
	if (urlQuery.page) {
		transfromedURL = `${transfromedURL}?page=${urlQuery.page}`;
	}

	return transfromedURL;
};
