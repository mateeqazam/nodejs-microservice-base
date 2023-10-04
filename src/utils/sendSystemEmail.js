import { ServerClient } from 'postmark';

import logger from './logger';
import { POSTMARK_SERVER_TOKEN, PRIBOX_SENDER_EMAIL } from '../constants';

const postmarkClient = new ServerClient(POSTMARK_SERVER_TOKEN);

async function sendSystemEmail(params) {
	try {
		const { from, to, subject, html, attachments } = params || {};

		const emailOptions = {
			From: from || PRIBOX_SENDER_EMAIL,
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
