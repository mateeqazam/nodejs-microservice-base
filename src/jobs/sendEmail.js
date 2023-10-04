import logger from '../utils/logger';
import sendMailerEmail from '../utils/sendMailerEmail';
import parseJobParams from '../utils/helpers/parseJobParams';

async function sendEmailJob(job, additionalParams) {
	try {
		const emailToSchedule = job?.data || {};
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!emailToSchedule) return logUnsuccessfulJob('Missing Required Params.');

		const { sender } = emailToSchedule || {};
		if (!sender || sender.status !== 'active') {
			return logUnsuccessfulJob('Missing or Inactive Sender');
		}

		await sendMailerEmail(emailToSchedule);

		return { success: true, data: { emailToSchedule } };
	} catch (error) {
		const errorMessage = `[sendEmailJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: parseJobParams(job) });
		throw new Error(error || 'Something went wrong');
	}
}

export default sendEmailJob;
