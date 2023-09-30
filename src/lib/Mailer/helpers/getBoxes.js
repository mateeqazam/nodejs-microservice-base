import log from '../../../utils/log';
import { filter, has } from '../../../utils/helpers';

import { NON_INBOUND_BOXES } from '../constants';
import getMailboxTree from '../clients/imap/getMailboxTree';

function extractFolders(mailboxTree, parentPath = '') {
	const folders = [];
	if (!mailboxTree) return folders;

	Object.keys(mailboxTree).forEach((key) => {
		if (has(mailboxTree, key)) {
			const path = parentPath ? `${parentPath}/${key}` : key;
			folders.push({ label: key, path, attributes: mailboxTree[key].attribs });
			if (mailboxTree[key]?.children) {
				folders.push(...extractFolders(mailboxTree[key]?.children, path));
			}
		}
	});

	return folders;
}

async function getBoxes(imapClient, { receiverBoxes } = {}) {
	try {
		if (!imapClient) throw new Error('Missing MailBox IMAP Client');

		const { result: mailboxTree, error } = await getMailboxTree(imapClient);
		if (error) throw new Error(error);

		let folders = extractFolders(mailboxTree);
		if (receiverBoxes) {
			folders = filter(folders, (folder) => !NON_INBOUND_BOXES.includes(folder?.label));
		}

		return { result: folders };
	} catch (error) {
		const errorMessage = `[getBoxes] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { imapClient } });
		return { error };
	}
}

export default getBoxes;
