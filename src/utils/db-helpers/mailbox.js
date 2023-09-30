import log from '../log';
import { ObjectId } from '../db';
import { isEmpty, isArray } from '../helpers';
import MailboxModel from '../../models/mailbox';
import fetchAndProcessRecords from './fetchAndProcessRecords';

export async function getActiveSender(queryParams) {
	try {
		const { filter: filterObj, select } = queryParams || {};
		if (!filterObj || isEmpty(filterObj)) return { error: 'Missing Filter Params' };

		const filter = {
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
			...(filterObj || {}),
			status: 'active',
		};
		const result = await MailboxModel.findOne(filter, select);
		return { result: result?._doc || result };
	} catch (error) {
		const errorMessage = `[getActiveSender] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function getActiveSenders(senders) {
	if (!senders) return { error: 'Missing Senders' };

	let senderIds = [];
	try {
		if (isArray(senders)) senderIds = [...senders];
		else senderIds = [senders];

		const filter = {
			_id: { $in: senderIds.map((id) => new ObjectId(id)) },
			status: 'active',
			// 'config.messagePerDay': { $gt: 0 },
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};

		const select = null;
		const result = await MailboxModel.find(filter, select).limit(senderIds.length);
		return { result };
	} catch (error) {
		const errorMessage = `[getActiveSenders] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { senderIds } });
		return { error };
	}
}

export async function getMailbox(queryParams) {
	const { filter } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };

	try {
		const result = await MailboxModel.findOne(filter);
		return { result: result?._doc || result };
	} catch (error) {
		const errorMessage = `[getMailbox] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function updateMailbox(queryParams) {
	const { filter, write } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };
	if (!write || isEmpty(write)) return { error: 'Missing Write Object' };

	try {
		const options = { new: true };
		const result = await MailboxModel.findOneAndUpdate(filter, write, options);
		return { result };
	} catch (error) {
		const errorMessage = `[updateMailbox] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function getAndProcessMailboxes(queryParams, additionalParams = {}) {
	const { filter } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };

	try {
		const { processRecords, batchSize = 100 } = additionalParams || {};
		const { error, result } = await fetchAndProcessRecords(queryParams, {
			DBModel: MailboxModel,
			processRecords,
			batchSize,
		});
		if (error) throw new Error(error);

		return { result };
	} catch (error) {
		const errorMessage = `[getAndProcessMailboxes] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, params: { additionalParams } });
		return { error };
	}
}
