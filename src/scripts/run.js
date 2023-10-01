import 'dotenv/config';
import path from 'path';
import fs from 'fs/promises';

import logger from '../utils/logger';
import connectDatabase from '../services/MongoDB/connection';

async function runScript() {
	const fileName = process.argv[process.argv.length - 1];
	if (!fileName) {
		throw new Error('Script name is not provided. Please provide the script name.');
	}

	try {
		const scriptExtension = '.js';
		const scriptPath = path.join(__dirname, `${fileName}${scriptExtension}`);

		await fs.access(scriptPath, fs.constants.R_OK);

		await connectDatabase();

		const scriptModule = await import(scriptPath);
		if (typeof scriptModule.default === 'function') {
			logger.info(`[${fileName}] Script Starts at`, new Date());
			await scriptModule.default();
			logger.info(`[${fileName}] Script Completes at`, new Date());
		} else {
			throw new Error(`Error: 'default' function not found in ${fileName}${scriptExtension}.`);
		}
	} catch (error) {
		const errorMessage = `[${fileName}] Script Exception: ${fileName}: ${error.message}`;
		logger.error(errorMessage, { error });
		process.exitCode = 1;
	}
}

runScript();
