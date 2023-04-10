import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const URL = 'https://dan3002.tech/';
const MAX_INSTANCE = 3;

extractAll(URL, MAX_INSTANCE);
