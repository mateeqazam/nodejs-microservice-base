import log from '../log';
import { omit, removeEmptyProps } from '../helpers';
import { parseEmailAttributes, parseEmailBody } from '../../lib/Mailer/clients/imap/parser';

async function fetchEmail(imapClient, emailUID, box) {
	try {
		const fetch = await imapClient.fetch(emailUID, {
			bodies: [
				'HEADER.FIELDS (TO FROM SUBJECT DELIVERED-TO MESSAGE-ID DATE IN-REPLY-TO X-FAILED-RECIPIENTS RETURN-PATH)',
				'TEXT',
			],
		});

		let emailItem = { uid: emailUID, box };
		let bodyEventCount = 0;
		await new Promise((resolve, reject) => {
			fetch.on('message', async (msg) => {
				msg.once('attributes', async (attrs) => {
					const attributes = await parseEmailAttributes(attrs);
					emailItem.flags = attributes?.flags;
					emailItem.attributes = omit(attributes, 'flags');
				});

				msg.on('body', async (stream) => {
					bodyEventCount += 1;

					const parsedBody = await parseEmailBody(stream);
					emailItem = { ...emailItem, ...(parsedBody || {}) };

					bodyEventCount -= 1;
					if (bodyEventCount === 0) resolve();
				});

				msg.once('end', () => {
					if (bodyEventCount === 0) resolve();
				});
			});

			fetch.once('error', (err) => reject(err));
		});

		fetch.removeAllListeners();

		// if (emailItem?.from?.address === 'mailer-daemon@googlemail.com') {
		// 	console.log('emailItem is', emailItem);
		// }

		return removeEmptyProps(emailItem);
	} catch (error) {
		const errorMessage = `[fetchEmail] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { emailUID } });
		return null;
	}
}

export default fetchEmail;
