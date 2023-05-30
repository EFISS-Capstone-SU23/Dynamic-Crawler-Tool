// Setup mongonese
import mongoose from 'mongoose';

const {
	MONGODB_HOST,
	MONGODB_PORT,
	MONGODB_DATABASE,
	MONGODB_USERNAME,
	MONGODB_PASSWORD,
} = process.env;

const parrams = [
	'authSource=admin',
	'retryWrites=true',
	'w=majority',
];

let MONGODB_URI = `mongodb://${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?${parrams.join('&')}`;

if (MONGODB_USERNAME && MONGODB_PASSWORD) {
	MONGODB_URI = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}?${parrams.join('&')}`;
}

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
});

export default MONGODB_URI;
