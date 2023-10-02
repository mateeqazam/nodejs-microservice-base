import { filter, map } from 'lodash';
import promiseLimit from 'promise-limit';

import logger from '../../logger';
import { isNonEmptyArray } from '../../helpers';
import getActiveSendersWithTodayCount from '../../db-helpers/getActiveSendersWithTodayCount';

import validateSender from './validateSender';

async function validateSendersBatch(senders) {
	const pLimit = promiseLimit(10);
	const validatedSenders = await Promise.all(
		map(senders, (sender) => pLimit(() => validateSender(sender)))
	);
	return filter(validatedSenders, (sender) => sender && sender._id);
}

async function getValidSenders(senderIds) {
	if (!isNonEmptyArray(senderIds)) return null;

	try {
		const activeSenders = await getActiveSendersWithTodayCount(senderIds, true);
		const validSenders = await validateSendersBatch(activeSenders);
		return validSenders;
	} catch (error) {
		const errorMessage = `[getValidSenders] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { senderIds } });
		return null;
	}
}

export default getValidSenders;
