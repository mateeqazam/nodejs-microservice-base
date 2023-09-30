import log from '../../../../utils/log';
import { get } from '../../../../utils/helpers';
import { getDecryptedPassword } from '../../../../utils/encryption';

import MAILBOX_PROVIDERS_SETTINGS from '../../constants/emailProviderSettings';

const AUTH_TIMEOUT = 30000;
export const base64Encode = (data) => Buffer.from(data).toString('base64');

function getOutlookIMAP(email, socialAuth) {
	const { port, host } = MAILBOX_PROVIDERS_SETTINGS?.outlook?.imap || {};
	const xoauth2 = base64Encode(`user=${email}^Aauth=Bearer ${socialAuth.accessToken}^A^A`);

	return {
		port,
		host,
		xoauth2,
		authTimeout: AUTH_TIMEOUT,
		tls: true,
		tlsOptions: { servername: host, rejectUnauthorized: false },
	};
}

function getCustomIMAP(config, decrypt) {
	const { port, host, username, password, security } = config || {};
	return {
		port,
		host,
		user: username,
		password: decrypt ? getDecryptedPassword(password) : password,
		authTimeout: AUTH_TIMEOUT,
		tls: security === 'ssl/tls',
		tlsOptions: { servername: host, rejectUnauthorized: false },
	};
}

function getDefaultIMAP(provider, email, password, decrypt) {
	const { port, host } = get(MAILBOX_PROVIDERS_SETTINGS, `[${provider}].imap`, {}) || {};
	return {
		port,
		host,
		user: email,
		password: decrypt ? getDecryptedPassword(password) : password,
		authTimeout: AUTH_TIMEOUT,
		tls: true,
		tlsOptions: { servername: host, rejectUnauthorized: false },
	};
}

function getIMAPConfig(mailbox, decrypt = true) {
	try {
		if (!mailbox) throw new Error('Missing mailbox parameters');

		const { provider, email, password, imap = {}, socialAuth = {} } = mailbox;
		switch (provider) {
			case 'outlook':
				return getOutlookIMAP(email, socialAuth);
			case 'other':
			case 'custom':
				return getCustomIMAP(imap, decrypt);
			default:
				return getDefaultIMAP(provider, email, password, decrypt);
		}
	} catch (error) {
		const errorMessage = `[getIMAPConfig] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox, decrypt } });
		return null;
	}
}

export default getIMAPConfig;
