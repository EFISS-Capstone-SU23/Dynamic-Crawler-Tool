import './config/env.js';
import MONGODB_URI from './config/mongoose.js';
import Products from './models/Products.js';
import { bucket } from './app/storage/setupStorage.js';

const main = async () => {
	console.log('Test connection to database');
	console.log('MONGODB_URI:', MONGODB_URI);
	const allProducts = await Products.getAllProduct();
	console.log('Number of products:', allProducts.length);

	console.log('Test connection to storage');
	const file = bucket.file('testConnect.txt');
	// read file
	const [contents] = await file.download();
	console.log('Contents:', contents.toString());
};

main().then(() => {
	console.log('Done');
	process.exit(0);
}).catch((error) => {
	console.log('Error');
	console.log(error);
	process.exit(1);
});
