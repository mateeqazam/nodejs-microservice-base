import { pick } from 'lodash';
import NodeImap from 'node-imap';
import promiseLimit from 'promise-limit';

import logger from '../utils/logger';
import MailboxModel from '../models/mailbox';
import getIMAPConfig from '../lib/IMAP/getIMAPConfig';
import scheduleCronJob from '../utils/scheduleCronJob';

async function isImapConnected(config) {
	return new Promise((resolve) => {
		const imap = new NodeImap(config);

		imap.once('ready', () => {
			imap.end();
			resolve({ connected: true });
		});

		imap.once('error', (error) => {
			resolve({ connected: false, error });
		});

		imap.connect();
	});
}

async function checkIMAPConnection(mailbox) {
	if (!mailbox || mailbox.senderOnly || mailbox.deletedAt) return;

	try {
		const config = getIMAPConfig(mailbox);
		if (!config) {
			logger.fatal('[checkIMAPConnection] Unable to parse IMAP config', { data: mailbox });
			return;
		}

		const connectionStatus = await isImapConnected(config);
		const { connected, error: connectionError } = connectionStatus || {};
		if (!connected) throw new Error(connectionError || 'Unable to connect');
	} catch (error) {
		const errorMessage = `[checkIMAPConnection] Unable to connect IMAP. ${error?.message}`;
		logger.info(errorMessage, { error, params: { mailbox: pick(mailbox, ['_id', 'email']) } });
		await MailboxModel.updateOne({
			filter: { _id: mailbox._id },
			write: { senderOnly: true },
			ignoreDocumentNotFound: true,
		});
	}
}

async function checkIMAPConnections() {
	const mailboxes = await MailboxModel.find({
		filter: {
			status: 'active',
			provider: 'custom',
			senderOnly: { $ne: true },
			deletedAt: { $exists: false },
		},
		skipLimit: true,
	});

	const pLimit = promiseLimit(8);
	await Promise.all(mailboxes.map((mailbox) => pLimit(() => checkIMAPConnection(mailbox))));
}

function checkIMAPConnectionsCronJob() {
	// every 6 hours
	scheduleCronJob('0 0 */6 * * *', {
		title: 'checkIMAPConnections',
		func: checkIMAPConnections,
	});
}

export default checkIMAPConnectionsCronJob;
