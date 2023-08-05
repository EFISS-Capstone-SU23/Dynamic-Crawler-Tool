/* eslint-disable guard-for-in */
/* eslint-disable no-restricted-syntax */
export const transformImageURL = (url) => {
	const queryToRemove = [
		'width',
		'height',
		'quality',
		'h',
		'w',
		'q',
		'size',
	];

	// add https to url if it not contain protocol
	if (!url.startsWith('http')) {
		url = `https:${url}`;
	}

	// remove query in url if it contain queryToRemove
	const urlObject = new URL(url);
	for (const key in queryToRemove) {
		urlObject.searchParams.delete(key);
	}

	// return string url
	return urlObject.toString();
};

export default (url, domain) => {
	// get all query of url as object
	let urlObject = null;

	try {
		urlObject = new URL(url);
	} catch (error) {
		return null;
	}

	const urlSearchParams = new URLSearchParams(urlObject.search);
	const urlQuery = Object.fromEntries(urlSearchParams.entries());

	// remove query string
	let transfromedURL = url.split('?')[0];

	// remove hash
	transfromedURL = transfromedURL.split('#')[0];

	// if url start with / then add domain and protocol
	transfromedURL = transfromedURL.startsWith('/') ? `https://${domain}${transfromedURL}` : transfromedURL;

	// if urlQuery contain page then add it back to url
	const query = {};
	if (urlQuery.page) {
		query.page = urlQuery.page;
	}

	if (urlQuery.p) {
		query.p = urlQuery.p;
	}

	if (Object.keys(query).length > 0) {
		const urlSearchParamsFinal = new URLSearchParams(query);
		transfromedURL += `?${urlSearchParamsFinal.toString()}`;
	}

	return transfromedURL;
};
