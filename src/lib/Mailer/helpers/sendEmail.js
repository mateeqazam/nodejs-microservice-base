import log from '../../../utils/log';

import sendEmailViaSMTP from '../clients/smtp/sendEmail';
import sendEmailViaOutlook from '../clients/outlook/sendEmail';
import {
	addSignatureToEmailBody,
	addUnsubscribeLinkToEmailBody,
	attachLinkTrackerToEmailBody,
	attachOpenTrackerToEmailBody,
	generateAddressField,
	interpolateVariables,
} from '.';

async function sendMail({ client, senderMailbox }, mailOptions) {
	if (senderMailbox?.provider === 'outlook') {
		return sendEmailViaOutlook(client, mailOptions);
	}

	return sendEmailViaSMTP(client, mailOptions);
}

async function sendMailWithRetry({ client, senderMailbox }, mailOptions, retries = 3) {
	if (!client) return { error: 'Missing Client' };
	if (!senderMailbox) return { error: 'Missing Sender Mailbox' };

	try {
		const { result, error } = await sendMail({ client, senderMailbox }, mailOptions);
		if (error) throw new Error(error);
		return { result };
	} catch (error) {
		const errorData = { error, data: { mailOptions, senderMailbox } };
		let errorMessage = '[sendMailWithRetry]';
		if (retries > 0) {
			errorMessage = `${errorMessage} Retrying... (${retries} retries left)`;
			log.info(errorMessage, errorData);
			return sendMailWithRetry({ client, senderMailbox }, mailOptions, retries - 1);
		}

		errorMessage = `${errorMessage} Exception: ${error?.message}`;
		log.error(errorMessage, errorData);
		return { error };
	}
}

async function sendEmail({ client, mailbox }, emailParams) {
	try {
		if (!mailbox) throw new Error('Missing MailBox');
		if (!client) throw new Error('Missing MailBox Sender Client');

		const { sender, recipient, emailData, isReply, trackingToken } = emailParams || {};
		if (!sender) throw new Error('Missing Sender');
		if (!recipient) throw new Error('Missing Recipient');
		if (isReply && (!emailData || !emailData?.parent || !emailData?.parent?.messageId)) {
			throw new Error('Reply in a thread requires a valid parent messageId');
		}

		const variables = { ...(recipient || {}) };
		const parentEmailSubject = isReply && emailData?.parent ? emailData.parent.subject : null;
		const subject = emailData?.subject || parentEmailSubject;
		const emailSubject = interpolateVariables(subject, variables);
		if (!emailSubject) throw new Error('Missing Email Subject');

		// TODO: unsubscribed & signature before attach links?
		const emailBody = attachOpenTrackerToEmailBody(
			addUnsubscribeLinkToEmailBody(
				attachLinkTrackerToEmailBody(
					addSignatureToEmailBody(
						interpolateVariables(emailData?.body, variables),
						sender?.signature
					),
					trackingToken
				),
				trackingToken
			),
			trackingToken
		);
		if (!emailBody) throw new Error('Missing Email Body');

		const mailOptions = {
			from: generateAddressField(sender),
			to: process.env.TEST_RECEIVER_EMAIL || recipient?.email,
			bcc: sender?.config?.bcc,
			subject: emailSubject,
			html: emailBody,
			...(isReply && { inReplyTo: emailData?.parent?.messageId }),
		};

		const { result, error } = await sendMailWithRetry(
			{ client, senderMailbox: mailbox },
			mailOptions
		);
		if (error) throw new Error(error);
		return { result: result ? { ...result, emailSubject, emailBody } : null };
	} catch (error) {
		const errorMessage = `[sendEmail] Exception: ${error?.message}`;
		log.error(errorMessage, { error, data: emailParams });
		return { error };
	}
}

export default sendEmail;
