import { get } from '../../../../utils/helpers';
import { getDecryptedPassword } from '../../../../utils/encryption';

import MAILBOX_PROVIDERS_SETTINGS from '../../constants/emailProviderSettings';

const SMTP_POOLING_OPTIONS = {
	pool: true,
	maxConnections: 730,
	socketTimeout: 12000000,
	// secure: true,
	// tls: {
	//   rejectUnauthorized: false,
	// },
};

function getCustomSMTP(config, decrypt) {
	const { port, host, username, password } = config || {};
	return {
		...SMTP_POOLING_OPTIONS,
		port,
		host,
		auth: {
			user: username,
			pass: decrypt ? getDecryptedPassword(password) : password,
		},
	};
}

function getDefaultSMTP(provider, email, password, decrypt) {
	const mailboxProviderSettings = get(MAILBOX_PROVIDERS_SETTINGS, `[${provider}].smtp`);
	if (!mailboxProviderSettings) {
		throw new Error('Missing Mailbox Provider Settings');
	}

	const { port, host } = mailboxProviderSettings || {};
	return {
		...SMTP_POOLING_OPTIONS,
		port,
		host,
		auth: { user: email, pass: decrypt ? getDecryptedPassword(password) : password },
	};
}

function getSMTPConfig(mailboxParams, decrypt = true) {
	const { provider, email, password, smtp = {} } = mailboxParams || {};
	switch (provider) {
		case 'other':
		case 'custom':
			return getCustomSMTP(smtp, decrypt);
		default:
			return getDefaultSMTP(provider, email, password, decrypt);
	}
}

export default getSMTPConfig;
