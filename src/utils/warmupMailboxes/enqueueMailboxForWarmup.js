import log from '../log';
import { BUSINESS_HOURS } from '../constants';
import checkJobExists from '../../lib/Queue/checkJobExists';
import warmupMailboxQueue from '../../queues/warmupMailbox';
import { generateWarmupMailboxJobKey } from '../helpers/generateJobKey';
import {
	getTimeAgo,
	getTimezoneHour,
	isCurrentTimeInBusinessHours,
	getPreviousBusinessDayCloseTime,
} from '../helpers';

const isValidMailbox = ({ _id, email } = {}) => _id && email;
function getTimeForFromTime(timezoneOffset) {
	if (getTimezoneHour(timezoneOffset) === BUSINESS_HOURS?.to) {
		return getPreviousBusinessDayCloseTime();
	}
	return getTimeAgo({ minutes: 40 });
}

async function enqueueMailboxForWarmup(mailbox) {
	try {
		if (!isValidMailbox(mailbox)) throw new Error('Invalid Mailbox');
		if (!isCurrentTimeInBusinessHours(mailbox?.timezoneOffset)) {
			return { enqueued: false };
		}

		const jobKey = generateWarmupMailboxJobKey(mailbox);
		if (!jobKey) throw new Error('Unable to generate job key');
		if (await checkJobExists(warmupMailboxQueue, jobKey)) {
			return { enqueued: false };
		}

		const fromTime = getTimeForFromTime(mailbox?.timezoneOffset);
		const toTime = getTimeAgo({ minutes: 10 });
		const filter = {
			from: mailbox?._id,
			status: 'sent',
			// isWarmup: true,
			// hasInteracted: false,
			// createdAt: { $gte: fromTime, $lte: toTime },
		};
		const jobData = { mailbox, filter };
		await warmupMailboxQueue.add(jobKey, jobData);

		return { enqueued: true };
	} catch (error) {
		const errorMessage = `[enqueueMailboxForWarmup] Exception: ${error?.message}`;
		log.error(errorMessage, { error, params: { mailbox } });
		return { error };
	}
}

export default enqueueMailboxForWarmup;
