import { LOGIN_XPATH } from '../xPath.js';
import { getElementByXpath } from '../../../utils/getElement.js';
import { delay } from '../../../utils/delay.js';

export default async function extractProductData(driver) {
	const email = process.env.SHOPPE_EMAIL;
	const password = process.env.SHOPPE_PASSWORD;

	driver.get('https://shopee.vn/buyer/login');
	await delay(2 * 1000);

	const emailInput = await getElementByXpath(driver, LOGIN_XPATH.EMAIL_INPUT);
	await emailInput.sendKeys(email);

	const passwordInput = await getElementByXpath(driver, LOGIN_XPATH.PASSWORD_INPUT);
	await passwordInput.sendKeys(password);

	const submit = await getElementByXpath(driver, LOGIN_XPATH.SUBMIT);
	await submit.click();

	await delay(10 * 1000);
}
