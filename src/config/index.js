import path from 'path';

export const {
	PORT = 5002,
	NODE_ENV: ENV = 'development',
	ENCRYPTION_KEY,
	PRIBOX_CAMPAIGN_SIMULATOR_HOST,
	PRIBOX_TRACKER_HEADER_TOKEN,
	INITIALIZATION_VECTOR = 'cqK8c766U0646O55',
	SLACK_HOOK_URL = '',
	PRIBOX_API_AUTH_TOKEN,
	PRIBOX_TRACKER_HOST = 'https://track-dev.pribox.io',
	PRIBOX_TRACKER_AUTH_TOKEN,
} = process.env;

export const IS_STAGING = ENV === 'staging';
export const IS_PRODUCTION = ENV === 'production';
export const IS_DEVELOPMENT = ENV === 'development';
export const IS_LOCAL = ENV !== 'production' && ENV !== 'staging';

export const TRACKING_PIXEL_IMAGE_FIE_NAME = 'pbpxl.png';
export const TRACKING_PIXEL_IMAGE_PATH = path.join(
	__dirname,
	'..',
	'assets',
	TRACKING_PIXEL_IMAGE_FIE_NAME
);

export const EMAIL_PIXEL_IMAGE_PATH = '/pbpxl.png';
export const DEFAULT_SEDNER_DELAY_BETWEEN_EMAILS = 5; // seconds
export const EMAIL_EVENTS = {
	EMAIL_OPENED: 'email_opened',
	LINK_CLICKED: 'link_clicked',
	UNSUBSCRIBED: 'unsubscribed',
};
