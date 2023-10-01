import scheduleEmailsQueue from '../queues/scheduleEmails';

async function scheduleEmailsScript() {
	await scheduleEmailsQueue.add('test', {});
}

export default scheduleEmailsScript;
