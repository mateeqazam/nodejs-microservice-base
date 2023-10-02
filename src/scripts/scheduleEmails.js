import scheduleEmails from '../utils/schedule-emails';
import scheduleEmailsQueue from '../queues/scheduleEmails';

async function scheduleEmailsScript() {
	// await scheduleEmailsQueue.add('test', {});
	await scheduleEmails();
}

export default scheduleEmailsScript;
