// Setup mongonese
import mongoose from 'mongoose';

const {
	MONGODB_HOST,
	MONGODB_PORT,
	MONGODB_DATABASE,
	MONGODB_USERNAME,
	MONGODB_PASSWORD,
} = process.env;

const MONGODB_URI = `mongodb://${MONGODB_USERNAME}:${MONGODB_PASSWORD}@${MONGODB_HOST}:${MONGODB_PORT}/${MONGODB_DATABASE}`;

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
});
