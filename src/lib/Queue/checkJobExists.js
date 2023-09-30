import log from '../../utils/log';
import { find } from '../../utils/helpers';

async function checkJobExists(queue, jobName) {
	if (!queue || !jobName) return false;

	try {
		const jobCounts = await queue.getJobCounts();
		const jobCount = jobCounts.waiting + jobCounts.active + jobCounts.delayed + jobCounts.completed;

		const jobs = await queue.getJobs(['waiting', 'active', 'delayed', 'completed'], 0, jobCount);
		return !!find(jobs, { name: jobName });
	} catch (error) {
		const errorMessage = `[checkJobExists] Exception: ${error?.message}`;
		log.error(errorMessage, { error, data: { queue, jobName } });
		return false;
	}
}

export default checkJobExists;
