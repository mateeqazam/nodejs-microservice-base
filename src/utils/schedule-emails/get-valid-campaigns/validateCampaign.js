import moment from 'moment';

import logger from '../../logger';
import { isNonEmptyArray } from '../../helpers';
// import { find, isNonEmptyArray, getDayName } from '../../helpers';

// TODO: complete this code

async function validateCampaign(campaign) {
	try {
		if (!campaign || !campaign._id || campaign.name) {
			throw new Error('Missing or Invalid Campaign');
		}

		const { sender: senders, duration, schedule } = campaign || {};
		if (!isNonEmptyArray(senders)) throw new Error('Missing Senders');

		// if (!duration) throw new Error('Missing Campaign Duration');
		// const { startingAt, endingAt } = duration || {};
		// if (!moment().isBetween(moment(startingAt), moment(endingAt), null, '[]')) {
		// 	throw new Error('Current time is not within the campaign duration.');
		// }

		// if (!schedule) throw new Error('Missing Campaign Schedule');
		// const currentDaySchedule = find(
		// 	schedule?.timings,
		// 	({ day = '' } = {}) => day.toLowerCase() === (getDayName() || '').toLowerCase()
		// );
		// if (!currentDaySchedule) throw new Error(`Missing Campaign Schedule for ${getDayName()}`);

		// const format = 'HH:mm:ss';
		// const currentTime = moment(moment().format(format), format);
		// const startTime = moment(currentDaySchedule.startTime, format);
		// const endTime = moment(currentDaySchedule.endTime, format);
		// if (!currentTime.isBetween(startTime, endTime, null, '[]')) {
		// 	const campaignName = campaign.name || 'Utitled';
		// 	const errorMessage = `[validateCampaign] Campaign "${campaignName}" is not scheduled for the current day and time. ${JSON.stringify(
		// 		currentDaySchedule
		// 	)}`;
		// 	log.trace(errorMessage, { data: { campaign } });
		// 	return null;
		// }

		return campaign;
	} catch (error) {
		const errorMessage = `[validateCampaign] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, data: { campaign } });
		return null;
	}
}

export default validateCampaign;
