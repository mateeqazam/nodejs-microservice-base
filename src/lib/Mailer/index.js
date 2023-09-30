import log from '../../utils/log';

import openBox from './helpers/openBox';
import getBoxes from './helpers/getBoxes';
import sendEmail from './helpers/sendEmail';
import moveToBox from './helpers/moveToBox';
import searchInBox from './helpers/searchInBox';

import setupIMAPClient from './setupIMAPClient';
import setupSenderClient from './setupSenderClient';
import { isNonEmptyArray } from '../../utils/helpers';

class Mailer {
	constructor(mailbox) {
		this.mailbox = mailbox;

		this.imapClient = null;
		this.senderClient = null;
	}

	async connectIMAP() {
		this.imapClient = await setupIMAPClient(this.mailbox);
		return this.imapClient;
	}

	async connectSMTP() {
		this.senderClient = await setupSenderClient(this.mailbox);
		return this.senderClient;
	}

	async getIMAPClient() {
		try {
			if (!this.imapClient) await this.connectIMAP();
			return { result: this.imapClient };
		} catch (error) {
			const errorMessage = `[Mailer.getIMAPClient] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}

	async getSenderClient() {
		try {
			if (!this.senderClient) await this.connectSMTP();
			return { result: this.senderClient };
		} catch (error) {
			const errorMessage = `[Mailer.getSenderClient] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}

	async sendEmail(mailOptions) {
		try {
			if (!this.senderClient) await this.connectSMTP();
			return sendEmail({ client: this.sendEmail, mailbox: this.mailbox }, mailOptions);
		} catch (error) {
			const errorMessage = `[Mailer.sendEmail] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox, params: mailOptions });
			return { error };
		}
	}

	async getBoxes() {
		try {
			if (!this.imapClient) await this.connectIMAP();
			return await getBoxes(this.imapClient);
		} catch (error) {
			const errorMessage = `[Mailer.getBoxes] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}

	async getReceiverBoxes() {
		try {
			if (!this.imapClient) await this.connectIMAP();
			return await getBoxes(this.imapClient, { receiverBoxes: true });
		} catch (error) {
			const errorMessage = `[Mailer.getReceiverBoxes] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}

	async openBox(box) {
		try {
			if (!this.imapClient) await this.connectIMAP();
			return await openBox(this.imapClient, box);
		} catch (error) {
			const errorMessage = `[Mailer.openBox] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox, params: { box } });
			return { error };
		}
	}

	async searchInBox(params) {
		const { filter, box } = params || {};
		try {
			if (!this.imapClient) await this.connectIMAP();

			const { result: openedBox, error: openBoxError } = await this.openBox(box?.path || box);
			if (openBoxError) throw new Error(openBoxError);

			return await searchInBox(this.imapClient, { filter, box: openedBox });
		} catch (error) {
			const errorMessage = `[Mailer.searchInBox] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox, params });
			return { error };
		}
	}

	async searchByMessageId(messageId, boxPath) {
		try {
			if (!messageId) throw new Error('Missing Message ID');

			if (!this.imapClient) await this.connectIMAP();
			let openedBox = null;
			if (boxPath) {
				const openBoxResult = await this.openBox(boxPath);
				if (openBoxResult?.error) throw new Error(openBoxResult?.error);
				openedBox = openBoxResult?.result;
			}

			const filter = ['ALL', ['HEADER', 'Message-ID', messageId]];
			const { result: emails, error } = await searchInBox(this.imapClient, {
				filter,
				box: openedBox,
			});
			if (error) throw new Error(error);

			// TODO: fetch emails / parse emails

			return isNonEmptyArray(emails) ? emails[0] : null;
		} catch (error) {
			const errorMessage = `[Mailer.searchByMessageId] Exception: ${error?.message}`;
			log.error(errorMessage, { error, data: this.mailbox, params: { messageId, boxPath } });
			return { error };
		}
	}

	async moveToBox(emailId, box) {
		try {
			if (!emailId || !box) throw new Error('Missing Email Id or Box');

			if (!this.imapClient) await this.connectIMAP();

			const targetBox = box.path || box;
			const { error } = await moveToBox(this.imapClient, { uid: emailId, targetBox });
			if (error) throw new Error(error);

			return { success: true, emailId };
		} catch (error) {
			const errorMessage = `[Mailer.moveToBox] Exception: ${error.message}`;
			log.error(errorMessage, { error, data: this.mailbox, params: { emailId, box } });
			return { error, emailId };
		}
	}

	async getInboxName() {
		try {
			if (this.inboxName) return { result: this.inboxName };

			const { result: boxes, error: boxesError } = await this.getBoxes();
			if (boxesError) throw new Error(boxesError);

			const inboxObj = boxes.find((box) => box?.name?.toLowerCase()?.endsWith('inbox'));
			this.inboxName = inboxObj?.path || 'INBOX';
			return { result: this.inboxName };
		} catch (error) {
			const errorMessage = `[Mailer.getInboxName] Error: ${error.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}

	async moveToInbox(emailId) {
		try {
			const { result: inboxName, error: inboxNameError } = await this.getInboxName();
			if (inboxNameError) throw new Error(inboxNameError);
			return await this.moveToBox(emailId, inboxName);
		} catch (error) {
			const errorMessage = `[Mailer.moveToInbox] Error: ${error.message}`;
			log.error(errorMessage, { error, data: this.mailbox });
			return { error };
		}
	}
}

export default Mailer;
