import { createClient } from 'redis';

import REDIS_CONFIG from '../../config/redis';

let REDIS_CLIENT = null;

async function connectRedis() {
	if (REDIS_CLIENT) return { res: REDIS_CLIENT };
	const REDIS_HOST = REDIS_CONFIG?.url || 'localhost';
	try {
		console.info('[connectRedis] Connecting Redis Server', REDIS_HOST);

		REDIS_CLIENT = createClient(REDIS_CONFIG);
		await REDIS_CLIENT.connect();

		REDIS_CLIENT.on('error', (error) => {
			// log error
			console.error(error, 'Redis Connection Error!');
		});
		console.info('[connectRedis] Redis Server Connected Successfully', REDIS_HOST);
		return { res: REDIS_CLIENT };
	} catch (err) {
		const error = err?.message || err || `Unable to connect Redis Server ${REDIS_HOST}`;
		console.error(error);

		return { err: error };
	}
}

export async function getRedisClient() {
	return REDIS_CLIENT;
}

export default connectRedis;
