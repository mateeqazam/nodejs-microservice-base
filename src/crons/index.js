import fs from 'fs';
import path from 'path';

import log from '../utils/log';
import { forEach } from '../utils/helpers';

function runCronJobs() {
	try {
		const cronJobsDirectory = __dirname;
		const files = fs.readdirSync(cronJobsDirectory);

		forEach(files, (file) => {
			if (!file || (!file.endsWith('.js') && !file.endsWith('.ts'))) return;
			if (file === 'index.js') return;

			const filePath = path.join(cronJobsDirectory, file);
			if (!fs.statSync(filePath)?.isFile()) return;

			// eslint-disable-next-line import/no-dynamic-require, global-require
			const cronJobModule = require(filePath);
			if (cronJobModule && cronJobModule.default) {
				cronJobModule.default();
			}
		});
	} catch (error) {
		const errorMessage = `[runCronJobs] Exception: ${error?.message}`;
		log.error(errorMessage, { error });
	}
}

export default runCronJobs;
