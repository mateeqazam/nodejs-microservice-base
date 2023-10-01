import logger from '../utils/logger';
import scheduleCronJob from '../utils/scheduleCronJob';
import checkJobExists from '../lib/Queue/checkJobExists';
import scheduleEmailsQueue from '../queues/scheduleEmails';
import { generateScheduleEmailsCronJobKey } from '../utils/helpers/generateJobKey';
import calculateNextTimeDifference from '../utils/helpers/calculateNextTimeDifference';

async function calculateDelayAndEnqueueScheduleEmailsJob() {
	try {
		const timeDiffResult = calculateNextTimeDifference();
		if (!timeDiffResult) throw new Error('Unable to calculate Next Time Difference.');

		const { difference, nextTargetMoment } = timeDiffResult || {};
		const jobKey = generateScheduleEmailsCronJobKey(nextTargetMoment);
		if (!jobKey) throw new Error('Unable to generate Job Key.');

		const jobExist = await checkJobExists(scheduleEmailsQueue, jobKey);
		if (!jobExist) {
			await scheduleEmailsQueue.add(jobKey, {}, { delay: difference });
			return { success: true };
		}

		return { success: false, reason: 'Job Already Exists' };
	} catch (error) {
		const errorMessage = `[calculateDelayAndEnqueueScheduleEmailsJob] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		return { success: false, reason: errorMessage };
	}
}

function scheduleEmailsCronJob() {
	scheduleCronJob('*/3 * * * *', {
		title: 'scheduleEmailsCronJob',
		func: calculateDelayAndEnqueueScheduleEmailsJob,
	});
}

export default scheduleEmailsCronJob;
