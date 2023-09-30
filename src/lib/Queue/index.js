import { Queue, Worker } from 'bullmq';
import { isFunction, merge } from 'lodash';

import logger from '../../utils/logger';
import logUnsuccessfulJob from '../../utils/logUnsuccessfulJob';
import { DEFAULT_JOB_OPTIONS, DEFAULT_WORKER_OPTIONS } from './constants';

function createQueueAndWorker(queueTitle, additionalParams = {}) {
	try {
		if (!queueTitle) throw new Error('Missing Queue Title');

		const {
			worker: workerFunc,
			queueOptions: customQueueOptions,
			workerOptions: customWorkerOptions,
			...restAdditionalParams
		} = additionalParams || {};

		if (!workerFunc) throw new Error('Missing Worker Function');
		if (!isFunction(workerFunc)) throw new Error('Invalid Worker Function');

		const queueOptions = merge({}, DEFAULT_JOB_OPTIONS, customQueueOptions);
		const queue = new Queue(queueTitle, queueOptions);

		const workerOptions = merge({}, DEFAULT_WORKER_OPTIONS, customWorkerOptions);
		// const worker = new Worker(queueTitle, workerFunc, workerOptions);
		const worker = new Worker(
			queueTitle,
			async (job) => {
				await workerFunc(job, {
					logUnsuccessfulJob: (reason, additionalData, ...params) =>
						logUnsuccessfulJob({ ...(additionalData || {}), queueTitle, job, reason }, ...params),
					...(additionalParams?.additionalParams || {}),
					...(restAdditionalParams || {}),
				});
			},
			workerOptions
		);

		const logJobRetry = (job, error) => {
			const { id, name, attemptsMade = 0, opts = {} } = job || {};

			const jobIdentifier = `${id}${name ? `:=${name}` : ''}`;
			const jobParams = { queueTitle, id, name };

			if (attemptsMade === opts.attempts) {
				logger.error(
					`${queueTitle} Worker Job ${jobIdentifier} has failed after all attempts. ${error?.message}`,
					{ error, jobParams }
				);
			} else {
				const retryNumber = attemptsMade + 1;
				const totalAttempts = opts.attempts || 0;
				const delay = opts.backoff?.delay || 0;
				logger.debug(
					`${queueTitle} Worker Job ${jobIdentifier} is retrying for the ${retryNumber} time out of ${totalAttempts} attempts after a delay of ${delay} ms. ${error?.message}`,
					{ error, jobParams }
				);
			}
		};

		// worker.on('completed', (job) => {
		// 	const { id, name } = job || {};
		// 	const jobIdentifier = `${id}${name ? `:=${name}` : ''}`;
		// 	log.info(`${queueTitle} Worker Job ${jobIdentifier} has completed successfully.`);

		// 	const { campaignId, nodeItemId, prospectId, senderId, stepType } = job?.data || {};
		// 	log.info(
		// 		`${queueTitle} Worker ${job?.id}:  ${JSON.stringify(
		// 			omitBy({ campaignId, nodeItemId, prospectId, senderId, stepType }, isNil)
		// 		)}`
		// 	);
		// });

		worker.on('error', (error) => {
			logger.error(`${queueTitle} Worker encountered an error: ${error.message}`, { error });
		});

		worker.on('failed', logJobRetry);

		return { queue, worker };
	} catch (error) {
		const errorMessage = `[createQueueAndWorker] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		return { error };
	}
}

export default createQueueAndWorker;
