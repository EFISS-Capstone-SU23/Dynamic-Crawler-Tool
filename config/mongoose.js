// Setup mongonese
import mongoose from 'mongoose';

mongoose.connect('mongodb://localhost:27017/rsi_dynamic_crawler', {
	useNewUrlParser: true,
});
