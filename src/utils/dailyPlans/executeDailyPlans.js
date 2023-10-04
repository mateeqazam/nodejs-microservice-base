import logger from '../logger';
import { getTodayTimestamp } from './helpers';
import DailyPlanModel from '../../models/dailyPlan';
import { ObjectId } from '../../lib/Mongoose/constants';
import DB_COLLECTIONS from '../../constants/dbCollections';

import executeDailyPlan from './executeDailyPlan';

async function executeDailyPlans() {
	try {
		const todayTimestamp = getTodayTimestamp();
		const filter = process.env.SCRIPT_MAILBOX_ID
			? { mailbox: ObjectId(process.env.MAILBOX_ID) }
			: {};

		const pipeline = [
			{ $match: { ...filter, date: todayTimestamp } },
			{
				$lookup: {
					from: DB_COLLECTIONS.mailbox,
					let: { mailbox: '$mailbox' },
					pipeline: [
						{
							$match: {
								status: 'active',
								isWarmUp: true,
								deletedAt: { $exists: false },
								$expr: { $and: [{ $eq: ['$_id', '$$mailbox'] }] },
							},
						},
					],
					as: 'sender',
				},
			},
			{ $unwind: '$sender' },
		];

		const aggCursor = DailyPlanModel.aggregate(pipeline);

		// eslint-disable-next-line no-restricted-syntax
		for await (const recordItem of aggCursor) {
			if (process.env.PRINT_LOG) {
				logger.debug('[executeDailyPlans] RecordItem:', recordItem);
			}
			await executeDailyPlan(recordItem);
		}
	} catch (error) {
		const errorMessage = `[executeDailyPlans] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default executeDailyPlans;
