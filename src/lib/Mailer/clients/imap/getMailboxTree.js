import log from '../../../../utils/log';
import { parseResponse } from '../../../../utils/helpers';

async function fetchMailboxTree(imapClient) {
	return new Promise((resolve, reject) => {
		imapClient.getBoxes((error, mailboxTree) => {
			if (error) return reject(error);
			return resolve(mailboxTree);
		});
	});
}

async function getMailboxTree(imapClient) {
	try {
		if (!imapClient) throw new Error('Missing IMAP Client');

		const { result, error } = await parseResponse(fetchMailboxTree(imapClient));
		if (error) throw new Error(error);
		return { result };
	} catch (error) {
		const errorMessage = `[getMailboxTree] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { imapClient } });
		return { error };
	}
}

export default getMailboxTree;
