/* eslint-disable no-promise-executor-return */
import logger from '../config/log.js';

/* eslint-disable no-restricted-syntax */
export const getDiffHeight = async (imageContainer) => {
	const scrollHeight = parseInt(await imageContainer.getAttribute('scrollHeight'), 10);
	const offsetHeight = parseInt(await imageContainer.getAttribute('offsetHeight'), 10);

	return scrollHeight - offsetHeight;
};

export const scrollElement = async (driver, imageContainer, diffHeight, imgLength) => {
	try {
		// scroll the page to load all images
		const rect = await imageContainer.getRect();

		// Calculate the x and y coordinates for the middle of the div element
		const x = Math.floor(rect.x + rect.width / 2);
		const y = Math.floor(rect.y + rect.height / 2);

		// Create a new ActionSequence object and move the mouse pointer to the middle of the div element
		const sequence = driver.actions({
			bridge: true,
		});
		await sequence.move({
			x,
			y,
		}).perform();

		// eslint-disable-next-line no-unused-vars
		imgLength -= 1;
		for (let i = 0; i < imgLength; i += 1) {
			// Simulate a scroll action
			await sequence.scroll(
				x,
				y,
				0,
				Math.floor(diffHeight / imgLength),
				'viewport',
			).perform();
		}
	} catch (error) {
		logger.error(`Error in scrollElement: ${error}`);
	}
};
