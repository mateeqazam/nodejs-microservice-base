import { IS_DEVELOPMENT } from './index';

const { REDIS_HOST = 'localhost', REDIS_PASSWORD, REDIS_PORT = 6379 } = process.env;

const REDIS_CONFIG = IS_DEVELOPMENT
	? {}
	: {
			url: `rediss://${REDIS_HOST}:${REDIS_PORT}`,
			password: REDIS_PASSWORD,
			// connectTimeout: 10000,
			// reconnectStrategy: (retries) => Math.min(retries * 100, 3000),
	  };

export { REDIS_HOST, REDIS_PASSWORD, REDIS_PORT };
export default REDIS_CONFIG;
