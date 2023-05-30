import { Storage } from '@google-cloud/storage';

const projectId = 'even-acumen-386115';
const keyFilename = './service_account.json';
const bucketName = 'efiss';

const storage = new Storage({
	projectId,
	keyFilename,
});

const bucket = storage.bucket(bucketName);

// // list all files in bucket
// bucket.getFiles().then((data) => {
// 	const files = data[0];
// 	console.log('Files:');
// 	files.forEach((file) => {
// 		console.log(file.name);
// 	});
// });

export { bucket, storage, bucketName };
