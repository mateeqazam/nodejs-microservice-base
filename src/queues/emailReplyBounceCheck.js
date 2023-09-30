import createQueueAndWorker from '../lib/Queue';
import replyBounceCheckJob from '../jobs/replyBounceCheck';

const queueTitle = 'email-reply-bounce-check-queue';
const { queue: emailReplyBounceCheckQueue, worker } = createQueueAndWorker(queueTitle, {
	worker: replyBounceCheckJob,
});

export const replyBounceCheckWorker = worker;
export default emailReplyBounceCheckQueue;
