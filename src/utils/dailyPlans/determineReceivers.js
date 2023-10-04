import { get, map, uniqBy } from 'lodash';

import logger from '../logger';
import MailboxModel from '../../models/mailbox';
import DailyPlanModel from '../../models/dailyPlan';
import { getTimestampWithDaysOffset } from './helpers';
import { ObjectId } from '../../lib/Mongoose/constants';

async function determineReceiversFromDailyPlans(mailboxId, additionalParams) {
	if (!mailboxId) return [];

	try {
		const { filter, limit = 100, email, receivers = [] } = additionalParams || {};
		const idsToNotInclude = [...map(receivers, (rec) => ObjectId(rec._id)), ObjectId(mailboxId)];

		const pipeline = [
			{ $match: { ...(filter || {}), mailbox: ObjectId(mailboxId) } },
			{ $unwind: '$hourlySchedule' },
			{
				$lookup: {
					from: 'mailboxes',
					localField: 'hourlySchedule.to',
					foreignField: '_id',
					as: 'mailbox',
				},
			},
			{ $match: { mailbox: { $ne: [] } } },
			{ $project: { mailbox: { $first: '$mailbox' }, _id: 0 } },
			{
				$match: {
					'mailbox.status': 'active',
					'mailbox.isWarmUp': true,
					'mailbox.deletedAt': { $exists: false },
					// "mailbox.subscription.plan": { $ne: "tester" },
					'mailbox.email': { $ne: email },
					'mailbox._id': { $nin: idsToNotInclude },
				},
			},
			{ $sort: { 'mailbox.receivingPriority': 1 } },
			{ $limit: limit },
			{ $replaceRoot: { newRoot: '$mailbox' } },
			{
				$project: {
					_id: 1,
					receivingPriority: 1,
					firstName: 1,
					lastName: 1,
					email: 1,
					isWarmUp: 1,
				},
			},
		];

		return await DailyPlanModel.aggregate(pipeline);
	} catch (error) {
		const errorMessage = `[determineReceiversFromDailyPlans] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { mailboxId, ...(additionalParams || {}) } });
		return [];
	}
}

async function determineNewReceivers(mailboxId, additionalParams) {
	if (!mailboxId) return [];

	try {
		const { receivers = [], filter, limit = 100, email } = additionalParams || {};
		const idsToNotInclude = [...map(receivers, (rec) => ObjectId(rec._id)), ObjectId(mailboxId)];

		const query = {
			...(filter || {}),
			status: 'active',
			isWarmUp: true,
			deletedAt: { $exists: false },
			// 'subscription.plan': { $ne: 'tester' },
			_id: { $nin: idsToNotInclude },
			email: { $ne: email },
		};

		const projection = {
			_id: 1,
			receivingPriority: 1,
			firstName: 1,
			lastName: 1,
			email: 1,
			// "subscription.plan": 1,
			isWarmUp: 1,
		};

		return await MailboxModel.find({
			filter: query,
			select: projection,
			sort: { receivingPriority: 1 },
			limit,
		});
	} catch (error) {
		const errorMessage = `[determineNewReceivers] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { mailboxId, ...(additionalParams || {}) } });
		return [];
	}
}

async function determineReceivers(recordItem, daysOffset) {
	if (!recordItem) return null;

	try {
		let receivers = [];
		const yesterdayTimestamp = getTimestampWithDaysOffset(daysOffset - 1);
		const emailsCount = get(recordItem, 'emailCount');
		if (!emailsCount) return receivers;

		// 20% from yesterday
		const receiversFromYesterday = await determineReceiversFromDailyPlans(recordItem._id, {
			filter: { date: yesterdayTimestamp },
			limit: Math.ceil(emailsCount * 0.2),
			email: recordItem.email,
		});
		receivers.push(...(receiversFromYesterday || []));

		// 35% from previous days
		const receiversFromPreviousDays = await determineReceiversFromDailyPlans(recordItem._id, {
			receivers,
			filter: { date: { $lt: yesterdayTimestamp } },
			limit: Math.ceil(emailsCount * 0.35),
			email: recordItem.email,
		});
		receivers.push(...(receiversFromPreviousDays || []));

		receivers = uniqBy(receivers, (rec) => String(rec._id));

		const restQuota = emailsCount - receivers.length;

		// 70% new receivers from rest Quota
		const newReceivers = await determineNewReceivers(recordItem._id, {
			receivers,
			filter: { receiverOnly: { $ne: true } },
			limit: Math.ceil(restQuota * 1),
			email: recordItem.email,
		});
		receivers.push(...(newReceivers || []));

		// 30% receiver only from rest Quota
		// const newReceiversFromReceiverOnlyQuota = await determineNewReceivers(recordItem._id, {
		// 	receivers,
		// 	filter: { receiverOnly: true },
		// 	limit: Math.ceil(restQuota * 0.3),
		// 	email: recordItem.email
		// });
		// receivers.push(...(newReceiversFromReceiverOnlyQuota || []));

		receivers = receivers.slice(0, emailsCount);

		await MailboxModel.updateMany({
			filter: { _id: { $in: map(receivers, (rec) => ObjectId(rec._id)) } },
			write: { $inc: { receivingPriority: 1 } },
		});

		return receivers;
	} catch (error) {
		const errorMessage = `[determineReceivers] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { recordItem, daysOffset } });
		return null;
	}
}

export default determineReceivers;
