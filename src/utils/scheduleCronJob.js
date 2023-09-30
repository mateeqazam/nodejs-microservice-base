import schedule from 'node-schedule';

function scheduleCronJob(rule, { title, func } = {}) {
	if (!rule || !func) return;

	const jobTitle = title || func.name;
	schedule.scheduleJob(rule, async () => {
		console.info(`[${jobTitle}] Job started at`, new Date());
		try {
			await func();
			console.info(`[${jobTitle}] Job completed at`, new Date());
		} catch (err) {
			console.error(`[${jobTitle}] Job exception error`, err?.message || err);
		}
	});
}

export default scheduleCronJob;
