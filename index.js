import './config/mongoose.js';
import extractAll from './app/extract-all-link/extractAll.js';

const URL = 'https://boo.vn/';
const MAX_INSTANCE = 1;

process.setMaxListeners(MAX_INSTANCE + 5);

extractAll(URL, MAX_INSTANCE);
