import logger from '../../utils/logger';
import { getRedisClient } from './connection';

export async function setInRedis(key, value, options = {}) {
	if (!key) return { error: 'Missing Redis Key' };

	try {
		const redisClient = await getRedisClient();

		let result = null;
		const { expiresAt } = options;
		if (!expiresAt) {
			result = await redisClient.set(key, JSON.stringify(value));
		} else {
			result = await redisClient.setEx(key, expiresAt, JSON.stringify(value));
		}

		if (!result || result.toUpperCase() !== 'OK') {
			return { success: false, error: 'Unable to set to Redis' };
		}
		return { success: true };
	} catch (error) {
		const errorMessage = `[setInRedis] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		throw error;
	}
}

export async function getFromRedis(key) {
	if (!key) return { error: 'Missing Redis Key' };

	try {
		const redisClient = await getRedisClient();
		const value = await redisClient.get(key);
		return value ? JSON.parse(value) : null;
	} catch (error) {
		const errorMessage = `[getFromRedis] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		throw error;
	}
}
