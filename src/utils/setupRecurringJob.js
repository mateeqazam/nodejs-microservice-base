import { assign } from 'lodash';
import logger from './logger';

async function setupRecurringJob(queue, { repeatRule, jobKey, jobData, jobOptions } = {}) {
	if (!queue || (!repeatRule && !jobOptions)) return;

	const jobTitle = jobKey || `${queue?.name}RecurringJob`;
	try {
		logger.info(`[${jobTitle}] Job started at`, new Date());

		const recurringJobOptions = assign(
			{},
			jobOptions || {},
			repeatRule ? { repeat: repeatRule } : {}
		);
		if (!recurringJobOptions?.repeat) return;

		await queue.add(jobTitle, jobData || {}, recurringJobOptions);

		logger.info(`[${jobTitle}] Job added at`, new Date());
	} catch (error) {
		logger.error(`[${jobTitle}] Job exception error`, error?.message || error);
	}
}

export default setupRecurringJob;
