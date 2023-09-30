import { createClient } from 'redis';

import logger from '../../utils/logger';
import REDIS_CONFIG from '../../config/redis';

let REDIS_CLIENT = null;

async function connectRedis() {
	if (REDIS_CLIENT) return REDIS_CLIENT;
	const REDIS_HOST = REDIS_CONFIG?.url || 'localhost';

	try {
		logger.info('[connectRedis] Connecting Redis Server', REDIS_HOST);

		REDIS_CLIENT = createClient(REDIS_CONFIG);
		await REDIS_CLIENT.connect();

		REDIS_CLIENT.on('error', (error) => {
			const errorMessage = `[connectRedis] Redis connection error: ${error?.message}`;
			logger.error(errorMessage, { error });
			throw error;
		});

		logger.info('[connectRedis] Redis Server Connected Successfully', REDIS_HOST);
		return REDIS_CLIENT;
	} catch (error) {
		const errorMessage = `[connectRedis] Exception: ${
			error?.message || `Unable to connect Redis Server ${REDIS_HOST}`
		}`;
		logger.error(errorMessage, { error });
		throw error;
	}
}

export async function getRedisClient() {
	return REDIS_CLIENT;
}

export default connectRedis;
