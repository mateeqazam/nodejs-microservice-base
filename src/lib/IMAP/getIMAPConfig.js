import { getDecryptedPassword } from '../../utils/encryption';

import { base64 } from './helpers';
import mailProvidersConfig from './mailProvidersConfig';

function createCustomIMAPConfig(config, decrypt, authTimeout) {
	if (!config) return null;

	return {
		port: config.port,
		host: config.host,
		user: config.username,
		password: decrypt ? getDecryptedPassword(config.password) : config.password,
		authTimeout,
		tls: config.security === 'ssl/tls',
		tlsOptions: { servername: config.host, rejectUnauthorized: false },
	};
}

function createOutlookIMAPConfig(args, providerObj, authTimeout) {
	if (!args || !providerObj) return null;

	const auth2 = base64(`user=${args.email}^Aauth=Bearer ${args.social.accessToken}^A^A`);
	return {
		port: providerObj.port,
		host: providerObj.host,
		xoauth2: auth2,
		authTimeout,
		tls: true,
		tlsOptions: { servername: providerObj.host, rejectUnauthorized: false },
	};
}

function createDefaultIMAPConfig(args, providerObj, decrypt, authTimeout) {
	if (!args || !providerObj) return null;

	return {
		port: providerObj.port,
		host: providerObj.host,
		user: args.email,
		password: decrypt ? getDecryptedPassword(args.password) : args.password,
		authTimeout,
		tls: true,
		tlsOptions: { servername: providerObj.host, rejectUnauthorized: false },
	};
}

function getIMAPConfig(args, decrypt = true) {
	const type = 'imap';
	const authTimeout = 30000;
	const providerObj = mailProvidersConfig[args?.provider];

	switch (args.provider) {
		case 'other':
		case 'custom':
			return createCustomIMAPConfig(args[type], decrypt, authTimeout);
		case 'outlook':
			return createOutlookIMAPConfig(args, providerObj[type], authTimeout);
		default:
			return createDefaultIMAPConfig(args, providerObj[type], decrypt, authTimeout);
	}
}

export default getIMAPConfig;
