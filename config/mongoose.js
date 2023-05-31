// Setup mongonese
import mongoose from 'mongoose';

const {
	MONGODB_HOST,
	MONGODB_PORT,
	MONGODB_DATABASE = '',
	MONGODB_USERNAME,
	MONGODB_PASSWORD,
} = process.env;

const parrams = [
	'authSource=admin',
	'retryWrites=true',
	'w=majority',
];

const PROTOCOL = MONGODB_PORT ? 'mongodb' : 'mongodb+srv';
const USER = MONGODB_USERNAME && MONGODB_PASSWORD ? `${MONGODB_USERNAME}:${MONGODB_PASSWORD}@` : '';
const HOST = MONGODB_PORT ? `${MONGODB_HOST}:${MONGODB_PORT}` : `${MONGODB_HOST}`;

const MONGODB_URI = `${PROTOCOL}://${USER}${HOST}/${MONGODB_DATABASE}?${parrams.join('&')}`;

mongoose.connect(MONGODB_URI, {
	useNewUrlParser: true,
});

export default MONGODB_URI;
