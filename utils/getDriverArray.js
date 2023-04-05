import { getDriver } from './chromeDriver.js';

export default function getDriverArray(length) {
	const driverArray = [];

	for (let i = 0; i < length; i++) {
		driverArray.push(getDriver());
	}

	return driverArray;
}
