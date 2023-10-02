import { ServerClient } from 'postmark';

import logger from './logger';
import { POSTMARK_SERVER_TOKEN } from '../constants';

const postmarkClient = new ServerClient(POSTMARK_SERVER_TOKEN);

async function sendSystemEmail(params) {
	try {
		const { from, to, subject, html, attachments } = params || {};

		const emailOptions = {
			From: from,
			To: to,
			Subject: subject,
			HtmlBody: html,
			...(attachments && { Attachments: attachments }),
		};

		await postmarkClient.sendEmail(emailOptions);

		logger.trace(`System email sent successfully: ${subject}`, { params });
	} catch (error) {
		const errorMessage = `[sendSystemEmail] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params });
		throw error;
	}
}

export default sendSystemEmail;
