import { map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import { MS_IN_HOUR } from '../../constants';
import SentEmailModel from '../../models/sentEmail';
import positiveInteractQueue from '../../queues/positiveInteract';
import DB_COLLECTIONS from '../../constants/dbCollections';

async function enqueueToPositiveInteract() {
	try {
		const pipeline = [
			{
				$match: {
					hasInteracted: false,
					createdAt: { $lte: new Date(), $gte: new Date(Date.now() - MS_IN_HOUR) },
				},
			},
			{
				$lookup: {
					from: DB_COLLECTIONS.mailbox,
					localField: 'from',
					foreignField: '_id',
					as: 'fromMailbox',
				},
			},
			{ $unwind: '$fromMailbox' },
			{
				$match: { 'fromMailbox.status': 'active', 'fromMailbox.deletedAt': { $exists: false } },
			},
			{
				$project: {
					to: 1,
					from: 1,
					messageId: 1,
					isReply: 1,
					senderPlan: '$fromMailbox.subscription.plan',
				},
			},
			{
				$group: { _id: '$to', to: { $first: '$to' }, emails: { $push: '$$ROOT' } },
			},
			{ $sort: { _id: 1 } },
			{ $project: { 'emails.to': 0 } },
			{ $limit: 1000 },
		];

		const emailsToInteractWith = await SentEmailModel.aggregate(pipeline);
		if (!isNonEmptyArray(emailsToInteractWith)) return;

		const pLimit = promiseLimit(20);
		await Promise.all(
			map(emailsToInteractWith, (emailItem) =>
				pLimit(() => positiveInteractQueue.add(`positive-interaction-${emailItem?.to}`, emailItem))
			)
		);
	} catch (error) {
		const errorMessage = `[enqueueToPositiveInteract] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default enqueueToPositiveInteract;
