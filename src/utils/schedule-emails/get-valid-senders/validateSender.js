import { get, omit } from 'lodash';

import logger from '../../logger';
import { getDayName } from '../../helpers/date';

async function validateSender(sender) {
	try {
		if (!sender || !sender._id || !sender.email) throw new Error('Missing or Invalid Sender');
		if (!sender.config) throw new Error('Missing Sender Configuration');

		const { messagePerDay = 0 } = sender.config;
		const todayEmailsCount = get(sender, 'todayEmailsCount.count', 0);
		if (messagePerDay <= todayEmailsCount) {
			const senderEmail = sender.email;
			const errorMessage = `Sender "${senderEmail}" has exceeded the daily email quota for ${getDayName()}`;
			logger.trace(errorMessage, { data: sender });
			return null;
		}

		return {
			...omit(sender, ['todayEmailsCount']),
			todayEmailsCount,
			quota: messagePerDay - todayEmailsCount,
		};
	} catch (error) {
		const errorMessage = `[validateSender] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { sender } });
		return null;
	}
}

export default validateSender;
