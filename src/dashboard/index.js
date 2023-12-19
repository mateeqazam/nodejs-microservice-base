import path from 'path';
import fs from 'fs/promises';
import { map } from 'lodash';
import promiseLimit from 'promise-limit';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import logger from '../utils/logger';
import { BULLMQ_DASHBOARD_ENDPOINT } from '../constants';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath(BULLMQ_DASHBOARD_ENDPOINT);

const queueDirectory = path.join(__dirname, '../queues');

async function loadQueue(queueFile) {
	try {
		if (!queueFile || !(queueFile.endsWith('.js') || queueFile.endsWith('.ts'))) {
			return null;
		}

		const filePath = path.join(queueDirectory, queueFile);
		const queueModule = await import(filePath);
		if (queueModule?.default || queueModule) {
			return new BullMQAdapter(queueModule.default || queueModule);
		}

		return null;
	} catch (error) {
		logger.error(`[loadQueue] Error importing ${queueFile}: ${error?.message}`, {
			error,
			data: { queueFile, queueDirectory },
		});
		return null;
	}
}

async function loadQueues() {
	try {
		const files = await fs.readdir(queueDirectory);

		const pLimit = promiseLimit(5);
		const queues = await Promise.all(map(files, (file) => pLimit(() => loadQueue(file))));

		const validQueues = queues.filter(Boolean);
		await createBullBoard({ queues: validQueues, serverAdapter });
	} catch (error) {
		logger.error(`[loadQueues] Error loading queues: ${error.message}`, { error });
	}
}

loadQueues();
export default serverAdapter;
