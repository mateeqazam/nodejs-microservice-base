import moment from 'moment';

import logger from '../logger';
import sendEmailQueue from '../../queues/sendEmail';
import { generateScheduleEmailJobKey } from '../helpers/generateJobKey';

const parseLogData = (emailToSchedule) => {
	const { receiver, sender, template, isReply, time } = emailToSchedule || {};
	return {
		to: `${receiver?._id}-${receiver?.email}`,
		from: `${sender?._id}-${sender?.email}`,
		template: template?._id,
		isReply: isReply || false,
		time,
	};
};

async function scheduleEmail(emailToSchedule) {
	try {
		const { receiver, sender, time } = emailToSchedule || {};

		const msDiff = moment(time).diff(moment());
		const isTimeWithinAllowedRange = msDiff >= 0 && msDiff <= 86400000;

		if (!isTimeWithinAllowedRange) {
			const errorMessage = `Skipping email. Time difference (${msDiff}) outside allowed range.`;
			logger.debug(errorMessage, { data: parseLogData(emailToSchedule) });
			return;
		}

		const jobKey = generateScheduleEmailJobKey(sender, receiver, msDiff);
		await sendEmailQueue.add(jobKey, emailToSchedule, { delay: msDiff });
	} catch (error) {
		const errorMessage = `[scheduleEmail] Exception: ${error?.message}`;
		logger.error(errorMessage, {
			error,
			params: emailToSchedule,
			data: parseLogData(emailToSchedule),
		});
	}
}

export default scheduleEmail;
