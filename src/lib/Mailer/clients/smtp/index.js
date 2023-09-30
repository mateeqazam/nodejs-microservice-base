import nodemailer from 'nodemailer';

import log from '../../../../utils/log';

import getSMTPConfig from './getSMTPConfig';

function getSMTPClient(mailbox) {
	try {
		const mailboxSMTPConfig = getSMTPConfig(mailbox);
		if (!mailboxSMTPConfig) throw new Error('Missing SMTP Config');

		return nodemailer.createTransport(mailboxSMTPConfig);
	} catch (error) {
		const errorMessage = `[getSMTPClient] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return null;
	}
}

export default getSMTPClient;
