const { OUTLOOK_CLIENT_ID, OUTLOOK_CLIENT_SECRET, PRIBOX_WEB_APP_URI } = process.env || {};

if (!PRIBOX_WEB_APP_URI) throw new Error('Missing Pribox Webapp URI');
if (!OUTLOOK_CLIENT_ID || !OUTLOOK_CLIENT_SECRET) throw new Error('Missing Outlook Credentials');

const OUTLOOK_CREDENTIALS = {
	authority: 'https://login.microsoftonline.com/common',
	client_id: OUTLOOK_CLIENT_ID,
	client_secret: OUTLOOK_CLIENT_SECRET,
	scopes: [
		'openid',
		'offline_access',
		'https://graph.microsoft.com/User.Read',
		'https://graph.microsoft.com/Mail.ReadWrite',
		'https://graph.microsoft.com/Mail.Send',
	],
	redirect_uri: PRIBOX_WEB_APP_URI,
};

export default OUTLOOK_CREDENTIALS;
