import { getDecryptedPassword } from '../../utils/encryption';

import mailProvidersConfig from './mailProvidersConfig';

const smtpPoolingOptions = {
	pool: true,
	maxConnections: 500, // Simultaneous connections from jobs that will come
};

function createCustomSMTPConfig(config, decrypt) {
	if (!config) return null;

	return {
		port: config.port,
		host: config.host,
		auth: {
			user: config.username,
			pass: decrypt ? getDecryptedPassword(config.password) : config.password,
		},
		...smtpPoolingOptions,
	};
}

function createDefaultSMTPConfig(args, providerObj, decrypt) {
	if (!args || !providerObj) return null;

	return {
		port: providerObj.port,
		host: providerObj.host,
		// secure: providerObj.secure,
		// secureConnection: false,
		auth: {
			user: args.email,
			pass: decrypt ? getDecryptedPassword(args.password) : args.password,
		},
		...smtpPoolingOptions,
	};
}

function getSMTPConfig(args, decrypt = true) {
	const type = 'smtp';
	const providerObj = mailProvidersConfig[args?.provider];

	switch (args.provider) {
		case 'other':
		case 'custom':
			return createCustomSMTPConfig(args[type], decrypt);
		default:
			return createDefaultSMTPConfig(args, providerObj[type], decrypt);
	}
}

export default getSMTPConfig;
