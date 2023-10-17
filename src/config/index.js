export const {
	PORT = 5002,
	NODE_ENV: ENV = 'local-dev',
	FILE_SIZE_LIMIT = '2mb',
	SLACK_HOOK_URL,
	ENCRYPTION_KEY,
} = process.env;

export const IS_LOCAL = ENV === 'local-dev';
export const IS_STAGING = ENV === 'staging';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';
export const IS_DEV = IS_LOCAL || IS_DEVELOPMENT || (!IS_PRODUCTION && !IS_STAGING);

export const BULLMQ_QUEUE_PREFIX = 'utilities-jobs';
export const BULLMQ_DASHBOARD_ENDPOINT = '/admin/queues-dashboard';
