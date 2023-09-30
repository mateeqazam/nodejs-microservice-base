import mongoose from 'mongoose';

import { MONGODB_HOST, MONGODB_NAME } from '../../config/mongo';

mongoose.Promise = global.Promise;

async function connectDatabase() {
	try {
		const dbURL = `${MONGODB_HOST}${MONGODB_NAME}`;
		console.info('[connectDatabase] Connecting Mongo Server', dbURL);

		const connectionOptions = { useUnifiedTopology: true, useNewUrlParser: true };
		const connection = await mongoose.connect(dbURL, connectionOptions);

		connection.connection
			.on('error', (err) => {
				console.error(`MongoDB connection error: ${err}`);
				throw err;
			})
			.on('close', () => console.info('Database connection closed.'));

		return { res: connection };
	} catch (err) {
		const error = err?.message || err || `Unable to connect Mongo Server ${MONGODB_HOST}`;
		console.error(error);
		return { err: error };
	}
}

export default connectDatabase;
