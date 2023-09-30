import mongoose from 'mongoose';

import logger from '../../utils/logger';
import { MONGODB_HOST, MONGODB_NAME } from '../../config/mongo';

mongoose.Promise = global.Promise;

async function connectDatabase() {
	try {
		const dbURL = `${MONGODB_HOST}${MONGODB_NAME}`;
		logger.info('[connectDatabase] Connecting Mongo Server', dbURL);

		const connectionOptions = { useUnifiedTopology: true, useNewUrlParser: true };
		const connection = await mongoose.connect(dbURL, connectionOptions);

		connection.connection
			.on('error', (error) => {
				const errorMessage = `[connectDatabase] MongoDB connection error: ${error?.message}`;
				logger.error(errorMessage, { error });
				throw error;
			})
			.on('close', () => logger.info('Database connection closed.'));

		return connection;
	} catch (error) {
		const errorMessage = `[connectDatabase] Exception: ${
			error?.message || `Unable to connect Mongo Server ${MONGODB_HOST}`
		}`;
		logger.error(errorMessage, { error });
		throw error;
	}
}

export default connectDatabase;
