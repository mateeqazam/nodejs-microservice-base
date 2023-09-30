import { getRedisClient } from './connection';

export async function setInRedis(key, value, options = {}) {
	if (!key) return { err: 'Missing Redis Key' };

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
			return { err: 'Unable to set to Redis' };
		}
		return { res: 'ok' };
	} catch (err) {
		return { err: err?.message || err };
	}
}

export async function getFromRedis(key) {
	if (!key) return { err: 'Missing Redis Key' };

	try {
		const redisClient = await getRedisClient();
		const value = await redisClient.get(key);
		return { res: value ? JSON.parse(value) : null };
	} catch (err) {
		return { err: err?.message || err };
	}
}
