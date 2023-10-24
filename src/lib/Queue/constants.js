import IORedis from 'ioredis';

import { ENV, IS_DEV, IS_PRODUCTION, BULLMQ_QUEUE_PREFIX } from '../../config';
import REDIS_CONFIG, { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../../config/redis';

let prefix = BULLMQ_QUEUE_PREFIX;
if (!IS_PRODUCTION) prefix = `${prefix}-${ENV}`;

export const redisConnection = new IORedis({
	port: REDIS_PORT,
	host: REDIS_HOST,
	username: 'default',
	password: REDIS_PASSWORD,
	maxRetriesPerRequest: null,
	retryStrategy: REDIS_CONFIG?.retryStrategy,
});

export const RETRIES = 3;
export const WORKERS_CONCURRENCY = 200;

export const DEFAULT_JOB_OPTIONS = {
	prefix,
	connection: redisConnection,
	limiter: {
		max: 1000,
		duration: 10000,
		bounceBack: false,
	},
	defaultJobOptions: {
		attempts: RETRIES,
		backoff: {
			type: 'exponential',
			delay: 3000,
		},
		removeOnComplete: !IS_DEV,
		removeOnFail: false,
	},
};

export const DEFAULT_WORKER_OPTIONS = {
	prefix,
	connection: redisConnection,
	concurrency: WORKERS_CONCURRENCY,
};
