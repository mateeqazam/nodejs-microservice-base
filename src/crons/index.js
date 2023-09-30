import path from 'path';
import fs from 'fs/promises';
import { filter, map } from 'lodash';

import logger from '../utils/logger';
import { isNonEmptyArray } from '../utils/helpers';

async function runCronJobs() {
	try {
		const cronJobsDirectory = __dirname;
		const files = await fs.readdir(cronJobsDirectory);
		if (!isNonEmptyArray(files)) return;

		const validFiles = filter(files, (file) => {
			if (!file) return false;

			const fileExtension = path.extname(file).toLowerCase();
			return ['.js', '.ts'].includes(fileExtension) && file !== 'index.js' && file !== 'index.ts';
		});
		if (!isNonEmptyArray(validFiles)) return;

		await Promise.all(
			map(validFiles, async (file) => {
				const filePath = path.join(cronJobsDirectory, file);
				const fileStat = await fs.stat(filePath);
				if (!fileStat.isFile()) return;

				const cronJobModule = await import(filePath);
				if (cronJobModule.default && typeof cronJobModule.default === 'function') {
					cronJobModule.default();
				}
			})
		);
	} catch (error) {
		const errorMessage = `[runCronJobs] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default runCronJobs;
