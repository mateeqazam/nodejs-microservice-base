import imap from 'imap-simple';

import logger from '../utils/logger';
import MailboxModel from '../models/mailbox';
import getIMAPConfig from '../lib/IMAP/getIMAPConfig';
import scheduleCronJob from '../utils/scheduleCronJob';

async function checkIMAPConnection(mailbox) {
	if (!mailbox || mailbox.senderOnly || mailbox.deletedAt) return;

	try {
		const imapConnection = await imap.connect({ imap: getIMAPConfig(mailbox) });
		imapConnection.end();
	} catch (error) {
		logger.info('[checkIMAPConnection] Unable to connect IMAP', { error, params: { mailbox } });
		await MailboxModel.updateOne({ filter: { _id: mailbox._id }, write: { senderOnly: true } });
	}
}

async function checkIMAPConnections() {
	const mailboxes = await MailboxModel.find({
		filter: {
			status: 'active',
			provider: 'custom',
			deletedAt: { $exists: false },
		},
		skipLimit: true,
	});

	await Promise.all(mailboxes.map((mailbox) => checkIMAPConnection(mailbox)));
}

function checkIMAPConnectionsCronJob() {
	// every 6 hours
	scheduleCronJob('0 0 */6 * * *', {
		title: 'checkIMAPConnections',
		func: checkIMAPConnections,
	});
}

export default checkIMAPConnectionsCronJob;
