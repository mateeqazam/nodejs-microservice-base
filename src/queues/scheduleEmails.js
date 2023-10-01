import createQueueAndWorker from '../lib/Queue';
import scheduleEmailsJob from '../jobs/scheduleEmails';

const queueTitle = 'schedule-emails-queue';
const { queue: scheduleEmailsQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: scheduleEmailsJob,
	workerOptions: { concurrency: 1 },
});

export const scheduleEmailsWorker = worker;
export default scheduleEmailsQueue;
