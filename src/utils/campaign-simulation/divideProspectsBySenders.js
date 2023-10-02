import { filter, find, chunk } from 'lodash';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';

// TODO: UPDATE THE DIVIDE PROSPECTS APPROACH
async function divideProspectsBySenders(params) {
	const result = [];

	try {
		const { senders, prospects, excludeProspects } = params || {};
		if (!isNonEmptyArray(senders)) return result;

		const filteredProspects = filter(
			prospects,
			(prospect) => !find(excludeProspects, { _id: prospect?._id })
		);
		if (!isNonEmptyArray(filteredProspects)) return result;

		const prospectsResult = [];
		const chunkedProspects = chunk(
			filteredProspects,
			Math.ceil(filteredProspects.length / senders.length)
		);
		chunkedProspects.forEach((chunked, senderIndex) => {
			const sender = senders[senderIndex];
			chunked.forEach((prospect) => {
				prospectsResult.push({ prospectId: prospect?._id, senderId: sender?._id });
			});
		});

		return prospectsResult;
	} catch (error) {
		const errorMessage = `[divideProspectsBySenders] Exception: ${error.message}`;
		logger.error(errorMessage, { error, params });
		return result;
	}
}

export default divideProspectsBySenders;
