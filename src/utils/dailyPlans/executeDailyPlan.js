import { isArray, map, forEach, find } from 'lodash';

import logger from '../logger';
import MailboxModel from '../../models/mailbox';
import { ObjectId } from '../../lib/Mongoose/constants';
import EmailTemplateModel from '../../models/emailTemplate';

import scheduleEmail from './scheduleEmail';

export default async function executeDailyPlan(recordItem) {
	if (!recordItem) return;

	try {
		const { sender, hourlySchedule } = recordItem || {};
		if (!sender || !isArray(hourlySchedule) || !hourlySchedule.length) return;

		const receiverIds = map(hourlySchedule, 'to');
		const receivers = await MailboxModel.find({
			filter: {
				_id: { $in: map(receiverIds, (id) => ObjectId(id)) },
				status: 'active',
				isWarmUp: true,
				deletedAt: { $exists: false },
			},
			skipLimit: true,
		});
		logger.debug('[executeDailyPlan] Receivers', {
			data: receivers?.length,
			receiverIds: receiverIds?.length,
		});

		const templateIds = map(hourlySchedule, 'template');
		const templates = await EmailTemplateModel.find({
			filter: {
				_id: { $in: map(templateIds, (id) => ObjectId(id)) },
				active: true,
				deletedAt: { $exists: false },
			},
			skipLimit: true,
		});
		logger.debug('[executeDailyPlan] templates', {
			templates: templates?.length,
			templateIds: templateIds?.length,
		});

		const emailsToSchedule = process.env.TESTING_SCRIPT ? [hourlySchedule[0]] : hourlySchedule;
		forEach(emailsToSchedule, (emailToSchedule = {}) => {
			const receiver = find(
				receivers,
				(item) => item?._id?.toString() === emailToSchedule?.to?.toString()
			);
			const template = find(
				templates,
				(item) => item?._id?.toString() === emailToSchedule?.template?.toString()
			);

			if (!receiver || !template) return;
			if (process.env.PRINT_LOG) {
				logger.debug('[executeDailyPlans] Scheduling Email:', {
					sender,
					receiver,
					time: emailToSchedule.time,
				});
			}

			scheduleEmail({ sender, receiver, template, time: emailToSchedule?.time });
		});
	} catch (error) {
		const errorMessage = `[executeDailyPlan] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: recordItem });
	}
}
