import fs from 'fs/promises';

import logger from '../logger';
import exportToCSV from '../exportToCSV';
import sendSystemEmail from '../sendSystemEmail';
import { IS_PRODUCTION, ENV } from '../../config';
import DailyPlanModel from '../../models/dailyPlan';
import { ADMIN_SUBSCRIBERS } from '../../constants';
import DB_COLLECTIONS from '../../constants/dbCollections';

import { getTimestampWithDaysOffset } from './helpers';

async function emailDailyPlans(daysOffset = 0) {
	try {
		const timestamp = getTimestampWithDaysOffset(daysOffset);

		const dailyPlans = await DailyPlanModel.aggregate([
			{ $match: { date: timestamp } },
			{
				$lookup: {
					from: DB_COLLECTIONS.mailbox,
					localField: 'mailbox',
					foreignField: '_id',
					as: 'mailboxes',
				},
			},
			{ $unwind: '$mailboxes' },
			{
				$project: {
					email: '$mailboxes.email',
					scheduledEmails: '$totalEmails',
					plannedEmails: 1,
				},
			},
		]);

		const filename = timestamp.toDateString();
		const csvFilePath = await exportToCSV(
			dailyPlans,
			['_id', 'email', 'plannedEmails', 'scheduledEmails'],
			filename
		);

		const fileContent = await fs.readFile(csvFilePath, 'utf-8');

		await sendSystemEmail({
			to: ADMIN_SUBSCRIBERS.join(','),
			subject: `${!IS_PRODUCTION ? `[${ENV}] ` : ''}Daily Plans created`,
			html: `${!IS_PRODUCTION ? `[${ENV}] ` : ''}Daily plans created for ${timestamp.toString()}`,
			attachments: [
				{
					Name: `${filename}.csv`,
					Content: Buffer.from(fileContent).toString('base64'),
					ContentType: 'text/csv',
					ContentID: null,
				},
			],
		});
	} catch (error) {
		const errorMessage = `[emailDailyPlans] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { daysOffset } });
	}
}

export default emailDailyPlans;
