import { isArray } from 'lodash';

import { isNonEmptyArray } from '../helpers';
import MailboxModel from '../../models/mailbox';

async function getActiveSenders(senders) {
	if (!senders) throw new Error('Missing Required Sender Ids');

	const senderIds = isArray(senders) ? [...senders].filter(Boolean) : [senders];
	if (!isNonEmptyArray(senderIds)) throw new Error('Invalid or Empty Sender Ids');

	const filter = {
		_id: { $in: senderIds.map((id) => id) },
		status: 'active',
		'config.messagePerDay': { $gt: 0 },
		$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
	};

	return MailboxModel.find({ filter, limit: senderIds.length });
}

export default getActiveSenders;
