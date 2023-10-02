import logger from '../logger';
import { getTodayDate } from '../helpers/date';
import { MAX_WARMUP_EMAILS } from '../../constants';
import MonthlyPlanModel from '../../models/monthlyPlan';
import generateWarmupPlan from '../helpers/generateWarmupPlan';
import MonthlyPlanArchiveModel from '../../models/monthlyPlanArchive';

const NUMBER_OF_WEEKS = 6; // number of weeks in a "monthly" plan

async function createMonthlyPlan(mailboxId, totalEmails = MAX_WARMUP_EMAILS) {
	try {
		if (!mailboxId) throw new Error('Missing Required Mailbox Id.');

		const startDate = getTodayDate();
		const emailPlan = generateWarmupPlan(totalEmails, NUMBER_OF_WEEKS, startDate);
		const monthlyPlan = await MonthlyPlanModel.findOne({ mailbox: mailboxId });

		if (monthlyPlan) {
			MonthlyPlanArchiveModel.create({
				mailbox: monthlyPlan.mailbox,
				totalEmails: monthlyPlan.totalEmails,
				dailySchedule: monthlyPlan.dailySchedule,
				startAt: monthlyPlan.startAt,
				endAt: monthlyPlan.endAt,
			});
		}

		const updatedPlan = await MonthlyPlanModel.updateOne({
			filter: { mailbox: mailboxId },
			write: {
				totalEmails,
				dailySchedule: emailPlan,
				startAt: startDate,
				endAt: emailPlan[emailPlan.length - 1].date,
			},
			upsert: true,
		});
		if (!updatedPlan) throw new Error('Unable to upsert new Monthly Plan');

		return updatedPlan;
	} catch (error) {
		const errorMessage = `[createMonthlyPlan] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { mailboxId, totalEmails } });
		throw error;
	}
}

export default createMonthlyPlan;
