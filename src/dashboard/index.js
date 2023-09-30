import fs from 'fs';
import path from 'path';
import promiseLimit from 'promise-limit';
import { createBullBoard } from '@bull-board/api';
import { ExpressAdapter } from '@bull-board/express';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';

import log from '../utils/log';
import { map, isEmpty } from '../utils/helpers';

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath('/admin/queues');

const projectRootDirectory = process.cwd();
const queueDirectory = path.join(projectRootDirectory, 'src/queues');

async function loadQueue(queueFile) {
	try {
		if (!queueFile) return null;
		if (!queueFile.endsWith('.js') && !queueFile.endsWith('.ts')) return null;

		const filePath = path.join(queueDirectory, queueFile);
		const { default: queueModule } = await import(filePath);
		if (queueModule && !isEmpty(queueModule)) return new BullMQAdapter(queueModule);

		return null;
	} catch (error) {
		log.error(`[loadQueue] Error importing ${queueFile}: ${error?.message}`, {
			error,
			data: { queueFile, queueDirectory },
		});
		return null;
	}
}

async function loadQueues() {
	try {
		const files = fs.readdirSync(queueDirectory);
		const pLimit = promiseLimit(5);
		const queues = await Promise.all(map(files, (file) => pLimit(() => loadQueue(file))));
		await createBullBoard({ queues: queues.filter(Boolean), serverAdapter });
	} catch (error) {
		log.error(`[loadQueues] Error loading queues: ${error.message}`, { error });
	}
}

loadQueues();
export default serverAdapter;
