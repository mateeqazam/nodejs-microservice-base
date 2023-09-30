import log from '../log';
import UnsubscribeEmailModel from '../../models/unsubscribedEmail';

// eslint-disable-next-line import/prefer-default-export
export async function upsertUnsubscribedRecord(recordItem) {
	const { senderId, prospectId } = recordItem || {};
	if (!senderId || !prospectId) return { error: 'Missing Required Params' };

	let queryParams = null;
	try {
		const filter = { senderId, prospectId };
		const update = { $set: { senderId, prospectId } };
		const options = { new: true, upsert: true };
		queryParams = { filter, update, options };
		const result = await UnsubscribeEmailModel.findOneAndUpdate(filter, update, options);
		return { result };
	} catch (error) {
		const errorMessage = `[upsertUnsubscribedRecord] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, data: recordItem });
		return { error };
	}
}
