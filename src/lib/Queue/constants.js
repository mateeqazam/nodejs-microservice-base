import { IS_LOCAL, IS_STAGING } from '../../config';
import { BULLMQ_QUEUE_PREFIX } from '../../constants';
import { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } from '../../config/redis';

let prefix = BULLMQ_QUEUE_PREFIX || 'microservice';
if (IS_LOCAL) prefix = `${prefix}-local`;
else if (IS_STAGING) prefix = `${prefix}-staging`;

export const redisConnection = {
	host: REDIS_HOST,
	port: REDIS_PORT,
	options: {
		password: REDIS_PASSWORD,
	},
};

export const RETRIES = 3;
export const WORKERS_CONCURRENCY = 1500;

export const DEFAULT_JOB_OPTIONS = {
	prefix,
	connection: redisConnection,
	limiter: {
		max: 1000,
		duration: 2500,
	},
	defaultJobOptions: {
		attempts: RETRIES,
		backoff: {
			type: 'exponential',
			delay: 3000,
		},
		removeOnComplete: IS_LOCAL,
		removeOnFail: false,
	},
};

export const DEFAULT_WORKER_OPTIONS = {
	prefix,
	connection: redisConnection,
	concurrency: WORKERS_CONCURRENCY,
};
