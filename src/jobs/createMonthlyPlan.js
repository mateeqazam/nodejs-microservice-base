import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import createMonthlyPlan from '../utils/warmup/createMonthlyPlan';

async function createMonthlyPlanJob(job, additionalParams) {
	try {
		const { mailboxId, totalEmails } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!mailboxId) return logUnsuccessfulJob('Missing Required Mailbox Id.');

		await createMonthlyPlan(mailboxId, totalEmails);

		return { success: true, data: { mailboxId } };
	} catch (error) {
		const errorMessage = `[createMonthlyPlanJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default createMonthlyPlanJob;
