import logger from '../logger';
import { IS_PRODUCTION } from '../../config';
import MailboxModel from '../../models/mailbox';
import { getTimestampWithDaysOffset } from './helpers';

import createDailyPlan from './createDailyPlan';
import emailDailyPlans from './emailDailyPlans';

async function createDailyPlans(daysOffset, filter) {
	try {
		const timestamp = getTimestampWithDaysOffset(daysOffset || 0);
		const isWeekend = [0, 6].includes(timestamp.getDay());

		const pipeline = [
			{
				$match: {
					...(filter || {}),
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
					as: 'monthly_plan_records',
				},
			},
			{ $match: { monthly_plan_records: { $ne: [] } } },
			{ $set: { monthlyPlan: { $first: '$monthly_plan_records' } } },
			{
				$set: {
					todayPlan: {
						$filter: {
							input: '$monthlyPlan.dailySchedule',
							as: 'dailySchedule',
							cond: { $eq: ['$$dailySchedule.date', timestamp] },
						},
					},
				},
			},
			{
				$project: {
					email: 1,
					timezoneOffset: 1,
					isWarmUp: 1,
					emailCount: {
						$cond: {
							if: { $ne: ['$todayPlan', []] },
							then: { $first: '$todayPlan.emailCount' },
							else: {
								$cond: {
									if: isWeekend,
									then: {
										$max: [
											{
												$round: {
													$multiply: [{ $last: '$monthlyPlan.dailySchedule.emailCount' }, 0.1],
												},
											},
											1,
										],
									},
									else: {
										$add: [
											{ $last: '$monthlyPlan.dailySchedule.emailCount' },
											{
												$multiply: [
													{
														$round: {
															$divide: [{ $last: '$monthlyPlan.dailySchedule.emailCount' }, 100],
														},
													},
													{
														$round: { $add: [{ $multiply: [{ $rand: {} }, 10] }, -5] },
													},
												],
											},
										],
									},
								},
							},
						},
					},
				},
			},
		];

		const aggCursor = MailboxModel.aggregate(pipeline);

		// eslint-disable-next-line no-restricted-syntax
		for await (const recordItem of aggCursor) {
			if (process.env.PRINT_LOG) {
				logger.debug('[executeDailyPlans] RecordItem:', recordItem);
			}
			await createDailyPlan(recordItem, daysOffset);
		}

		if (IS_PRODUCTION) await emailDailyPlans(daysOffset);
	} catch (error) {
		const errorMessage = `[createDailyPlans] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { daysOffset, filter } });
	}
}

export default createDailyPlans;
