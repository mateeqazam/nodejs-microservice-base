import moment from 'moment';

import logger from '../logger';
import { isNonEmptyArray } from '.';
import { EMAIL_SCHEDULING_MINUTES } from '../../constants';

function calculateNextTimeDifference() {
	try {
		const currentTime = moment();
		const targetMinutes = [...(EMAIL_SCHEDULING_MINUTES || [])];

		const currentMinute = currentTime.minutes();
		const nextTargetMinutes = targetMinutes.filter((minute) => minute > currentMinute);
		// const nextTargetMinutes = targetMinutes.filter((minute) =>
		// 	moment().minutes(minute).isAfter(currentTime)
		// );

		const nextTargetMinute = isNonEmptyArray(nextTargetMinutes)
			? Math.min(...nextTargetMinutes)
			: targetMinutes[0];

		const nextTargetMoment = moment().minutes(nextTargetMinute);
		const timeDifferenceInMilliseconds = nextTargetMoment.diff(currentTime);
		return { difference: timeDifferenceInMilliseconds, nextTargetMoment };
	} catch (error) {
		const errorMessage = `[calculateNextTimeDifference] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
		return null;
	}
}

export default calculateNextTimeDifference;
