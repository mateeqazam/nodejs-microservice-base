import { map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import MailboxModel from '../../models/mailbox';
import { MAX_WARMUP_EMAILS } from '../../constants';
import createMonthlyPlanQueue from '../../queues/createMonthlyPlan';

async function enqueueToCreateMonthlyPlan() {
	try {
		const pipeline = [
			{
				$match: {
					status: 'active',
					isWarmUp: true,
					deletedAt: { $exists: false },
				},
			},
			{
				$lookup: {
					from: 'monthly_plans',
					localField: '_id',
					foreignField: 'mailbox',
					as: 'plans',
				},
			},
			{ $match: { plans: [] } },
			{ $project: { _id: 1 } },
		];

		const newMailboxes = await MailboxModel.aggregate(pipeline);
		if (!isNonEmptyArray(newMailboxes)) return;

		const pLimit = promiseLimit(20);
		await Promise.all(
			map(newMailboxes, (mailbox) =>
				pLimit(() =>
					createMonthlyPlanQueue.add(`create-monthly-plan-${mailbox._id}`, {
						mailboxId: mailbox._id,
						totalEmails: MAX_WARMUP_EMAILS,
					})
				)
			)
		);
	} catch (error) {
		const errorMessage = `[enqueueToCreateMonthlyPlan] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default enqueueToCreateMonthlyPlan;
