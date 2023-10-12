import logger from '../utils/logger';

async function demoJob(job, additionalParams = {}) {
	try {
		logger.trace('params: ', { job, additionalParams });
		return { success: true, data: job?.data };
	} catch (error) {
		const errorMessage = `[demoJob] Exception: ${error.message}`;
		logger.error(errorMessage, { error, jobParams: job });
		throw new Error(error || 'Something went wrong');
	}
}

export default demoJob;
