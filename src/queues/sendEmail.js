import createQueueAndWorker from '../lib/Queue';
import sendEmailJob from '../jobs/sendEmail';

const queueTitle = 'send-email-queue';
const { queue: sendEmailQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: sendEmailJob,
});

export const sendEmailWorker = worker;
export default sendEmailQueue;
