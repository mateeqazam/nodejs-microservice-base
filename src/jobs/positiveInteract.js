import logger from '../utils/logger';
import parseJobParams from '../utils/helpers/parseJobParams';
import positiveInteract from '../utils/warmup/positiveInteract';

async function positiveInteractJob(job, additionalParams) {
	try {
		const { to: mailboxId, emails } = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!mailboxId) return logUnsuccessfulJob('Missing Required Mailbox Id.');

		await positiveInteract(mailboxId, emails);

		return { success: true, data: { mailboxId } };
	} catch (error) {
		const errorMessage = `[positiveInteractJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default positiveInteractJob;
