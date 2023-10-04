import nodemailer from 'nodemailer';

import logger from '../../utils/logger';
import { EMAIL_SUFFIX } from '../../constants';
import { camelToSnakeCase } from '../../utils/helpers';

import getOutlookApiClient from './outlookOAuth';
import getSMTPConfig from '../IMAP/getSMTPConfig';

class Mailer {
	constructor(senderMailbox) {
		this.fromMailbox = senderMailbox;

		switch (senderMailbox.provider) {
			case 'outlook':
				this.client = getOutlookApiClient(senderMailbox._id);
				break;
			default:
				this.client = nodemailer.createTransport(getSMTPConfig(senderMailbox));
		}
	}

	static injectVars(body = '', variables = {}) {
		let updatedBody = body;

		Object.keys(variables).forEach((key) => {
			const snakeCaseKey = camelToSnakeCase(key);
			updatedBody = updatedBody.replace(new RegExp(`{{${key}}}`, 'g'), variables[key]);
			updatedBody = updatedBody.replace(new RegExp(`{{${snakeCaseKey}}}`, 'g'), variables[key]);
		});

		return updatedBody;
	}

	static getAddressField(mailbox) {
		const name = `${mailbox.firstName} ${mailbox.lastName || ''}`.trim();
		return process.env.RECEIVER_EMAIL || `${name} <${mailbox.email}>`;
	}

	async sendEmailViaSMTP({ senderAddress, recipientAddress, subject, html, inReplyTo, bcc }) {
		const transporter = nodemailer.createTransport(getSMTPConfig(this.fromMailbox));
		return transporter.sendMail({
			to: recipientAddress,
			from: senderAddress,
			...(bcc ? { bcc } : {}),
			subject,
			html,
			inReplyTo,
		});
	}

	async sendEmailViaOutlook({ recipientName, recipientEmail, subject, html, inReplyTo, bcc } = {}) {
		const message = {
			subject,
			toRecipients: [{ emailAddress: { name: recipientName, address: recipientEmail } }],
			...(bcc ? { bccRecipients: [{ emailAddress: { address: bcc } }] } : {}),
			body: { content: html, contentType: 'html' },
		};

		if (inReplyTo) {
			try {
				const parent = await this.client
					.api('/me/messages')
					.filter(`internetMessageId eq '${encodeURIComponent(inReplyTo)}'`)
					.header('Prefer', 'IdType="ImmutableId"')
					.get();

				if (!parent?.value?.length) {
					const warnMessage = `[Mailer: sendEmailViaOutlook] No email with Message-Id ${inReplyTo} was found`;
					logger.warn(warnMessage, { data: { inReplyTo } });
					return {};
				}

				const draft = await this.client
					.api(`/me/messages/${parent.value[0].id}/createReply`)
					.header('Prefer', 'IdType="ImmutableId"')
					.post({ message });

				await this.client.api(`/me/messages/${draft.id}/send`).post();

				return { messageId: draft.internetMessageId };
			} catch (error) {
				const errorMessage = `[Mailer: sendEmailViaOutlook] Error while creating reply: ${error?.message}`;
				logger.error(errorMessage, { error, data: { inReplyTo, message } });
				return {};
			}
		}

		try {
			const draft = await this.client
				.api('/me/messages')
				.header('Prefer', 'IdType="ImmutableId"')
				.post(message);

			await this.client.api(`/me/messages/${draft.id}/send`).post();

			return { messageId: draft.internetMessageId };
		} catch (error) {
			const errorMessage = `[Mailer: sendEmailViaOutlook] Error while sending email: ${error?.message}`;
			logger.error(errorMessage, { error, data: { message } });
			return {};
		}
	}

	async sendEmail({
		toMailbox,
		template,
		isReply,
		parentMessageId,
		senderAddress,
		emailSign,
		bcc,
	} = {}) {
		if (isReply && !parentMessageId) return null;

		const body = Mailer.injectVars(template.text, {
			firstName: toMailbox.firstName,
			signature: emailSign,
		});

		const options = {
			senderAddress,
			recipientAddress: Mailer.getAddressField(toMailbox),
			recipientName: `${toMailbox.firstName} ${toMailbox.lastName || ''}`.trim(),
			recipientEmail: toMailbox.email,
			subject: `${template.subject} - ${EMAIL_SUFFIX}`,
			html: body,
			...(isReply && { inReplyTo: parentMessageId }),
			bcc,
		};

		switch (this.fromMailbox.provider) {
			case 'outlook':
				return this.sendEmailViaOutlook(options);
			default:
				return this.sendEmailViaSMTP(options);
		}
	}
}

export default Mailer;
