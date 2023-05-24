export default function convertPrice(price) {
	// Check if price is a string
	if (typeof price !== 'string') {
		return price;
	}

	// Remove all non-digit characters
	const priceString = price.replace(/[^0-9]/g, '');

	// Convert to number
	const priceNumber = Number(priceString);

	// Check if price is a number
	if (priceNumber) {
		return priceNumber;
	}

	return -1;
}
