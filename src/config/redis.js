import { IS_LOCAL } from './index';

const { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT } = process.env || {};

// TODO: add username and other config here instead of lib/Queue/constants file.
const REDIS_CONFIG = IS_LOCAL
	? {}
	: {
			host: REDIS_HOST || 'localhost',
			port: REDIS_PORT || 6379,
			password: REDIS_PASSWORD,
			connectTimeout: 10000,
			reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
	  };

export { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT };
export default REDIS_CONFIG;
