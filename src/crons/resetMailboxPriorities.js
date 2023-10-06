import scheduleCronJob from '../utils/scheduleCronJob';
import MailboxModel from '../models/mailbox';
import EmailTemplatePriorityModel from '../models/emailTemplatePriority';

async function resetMailboxPriorities() {
	await MailboxModel.updateMany({
		filter: { receivingPriority: { $gt: 0 } },
		write: { receivingPriority: 0 },
	});
	await EmailTemplatePriorityModel.updateMany({
		filter: { priority: { $gt: 0 } },
		write: { priority: 0 },
	});
}

function resetMailboxPrioritiesCronJob() {
	// 11pm every sunday
	scheduleCronJob('0 0 23 * * 7', {
		title: 'resetMailboxPriorities',
		func: resetMailboxPriorities,
	});
}

export default resetMailboxPrioritiesCronJob;
