import sendEmailJob from '../jobs/sendEmail';
import createQueueAndWorker from '../lib/Queue';

const queueTitle = 'email-sender-queue';
const { queue: emailSenderQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: sendEmailJob,
	queueOptions: { limiter: { max: 2000, duration: 4000 } },
	workerOptions: { concurrency: 2000 },
});

export const emailSenderWorker = worker;
export default emailSenderQueue;
