export const getDiffHeight = async (imageContainer) => {
	const scrollHeight = parseInt(await imageContainer.getAttribute('scrollHeight'), 10);
	const offsetHeight = parseInt(await imageContainer.getAttribute('offsetHeight'), 10);

	return scrollHeight - offsetHeight;
};

export const scrollElement = async (driver, imageContainer) => {
	// scroll the page to load all images
	// set mouse at center of image container and then simulate scroll

	const rect = await imageContainer.getRect();

	// Calculate the x and y coordinates for the middle of the div element
	const x = Math.floor(rect.width / 2);
	const y = Math.floor(rect.height / 2);

	// Create a new ActionSequence object and move the mouse pointer to the middle of the div element
	const sequence = driver.actions({
		bridge: true,
	});

	await sequence.move({
		origin: imageContainer,
		x,
		y,
	}).perform();

	// Simulate a scroll action by scrolling down by 500 pixels
	await sequence.scroll(
		x,
		y,
		0,
		200,
		imageContainer,
	).perform();
	await driver.executeScript('window.scrollBy(0, 500);');
};
