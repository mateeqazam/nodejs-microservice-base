import moment from 'moment';

import logger from '../logger';
import { TIME_SPAN_TO_SCHEDULE_CAMPAIGN_EMAILS } from '../../constants/simulation';

function calculateTimeRange(dt) {
	try {
		const interval = TIME_SPAN_TO_SCHEDULE_CAMPAIGN_EMAILS / 60; // in minutes
		const nextIntervalMinute = moment(dt)
			.add(interval - (moment(dt).minute() % interval), 'minutes')
			.startOf('minute');

		const toTime = moment(nextIntervalMinute).add(interval, 'minutes').startOf('minute');
		return { from: nextIntervalMinute.toDate(), to: toTime.toDate() };
	} catch (error) {
		const errorMessage = `[calculateTimeRange] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { dt } });
		return null;
	}
}

export default calculateTimeRange;
