import schedule from 'node-schedule';

import logger from './logger';

function scheduleCronJob(rule, { title, func } = {}) {
	if (!rule || !func) return;

	const jobTitle = title || func.name;
	schedule.scheduleJob(rule, async () => {
		logger.debug(`[${jobTitle}] Job started at`, new Date());
		try {
			await func();
			logger.debug(`[${jobTitle}] Job completed at`, new Date());
		} catch (error) {
			logger.error(`[${jobTitle}] Job exception error`, error?.message || error);
		}
	});
}

export default scheduleCronJob;
