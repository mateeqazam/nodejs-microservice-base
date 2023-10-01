import logger from '../utils/logger';

async function simulateCampaignJob(job, additionalParams = {}) {
	try {
		const { logUnsuccessfulJob } = additionalParams || {};
		if (!job?.data) return logUnsuccessfulJob('Missing Required Parameters');

		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[simulateCampaignJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, jobParams: job?.data });
		throw new Error(error || 'Something went wrong');
	}
}

export default simulateCampaignJob;
