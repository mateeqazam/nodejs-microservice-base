export const {
	PORT = 5002,
	NODE_ENV: ENV = 'development',
	FILE_SIZE_LIMIT = '2mb',
	SLACK_HOOK_URL = '',
	ENCRYPTION_KEY = '',
} = process.env;

export const IS_STAGING = ENV === 'staging';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';
export const IS_LOCAL = ENV === 'local-dev' || (!IS_PRODUCTION && !IS_STAGING);
