import log from '../log';
import { isEmpty, isNonEmptyArray, omit } from '../helpers';
import MailboxEmailModel from '../../models/mailboxEmail';

import fetchAndProcessRecords from './fetchAndProcessRecords';

export async function updateManyMailboxEmails(queryParams) {
	const { filter, write } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };
	if (!write || isEmpty(write)) return { error: 'Missing Write Object' };

	try {
		const update = {
			$set: {
				...(write.$set || {}),
				...omit(write, ['$setOnInsert', '$set']),
			},
			$setOnInsert: write?.$setOnInsert,
		};
		const result = await MailboxEmailModel.updateMany(filter, update);
		console.log('result is', result, filter, write, update);
		return { result };
	} catch (error) {
		const errorMessage = `[updateManyMailboxEmails] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams });
		return { error };
	}
}

export async function deleteManyMailboxEmails(filterParams) {
	try {
		const queryParams = {
			filter: filterParams,
			write: { $set: { deletedAt: new Date() } },
		};
		return await updateManyMailboxEmails(queryParams);
	} catch (error) {
		const errorMessage = `[deleteManyMailboxEmails] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { filter: filterParams } });
		return { error };
	}
}

export async function bulkWriteMailboxEmails(operations, options) {
	if (!isNonEmptyArray(operations)) return { error: 'Missing Opertaions' };

	try {
		const writeOps = options || { ordered: false };
		const result = await MailboxEmailModel.bulkWrite(operations, writeOps);
		return { result };
	} catch (error) {
		const errorMessage = `[bulkWriteMailboxEmails] Error: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams: { operations } });
		return { error };
	}
}

export async function getAndProcessMailboxEmails(queryParams, additionalParams = {}) {
	const { filter } = queryParams || {};
	if (!filter || isEmpty(filter)) return { error: 'Missing Filter Params' };

	try {
		const { processRecords, batchSize = 100 } = additionalParams || {};
		const { error, result } = await fetchAndProcessRecords(queryParams, {
			DBModel: MailboxEmailModel,
			processRecords,
			batchSize,
		});
		if (error) throw new Error(error);

		return { result };
	} catch (error) {
		const errorMessage = `[getAndProcessMailboxEmails] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: 1, error, queryParams, params: { additionalParams } });
		return { error };
	}
}
