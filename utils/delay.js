// eslint-disable-next-line no-promise-executor-return
export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
export const delayLoadingPage = async (driver) => {
	await driver.wait(() => driver.executeScript('return document.readyState').then((readyState) => readyState === 'complete'), 10000);
};
