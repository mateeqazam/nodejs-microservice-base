import logger from '../../../utils/logger';
import { isNonEmptyArray } from '../../../utils/helpers';

import logDBError from './logDBError';
import { parseQueryOptions, parseWriteOperations } from './parsers';

export async function count(CollectionModel, queryOptions) {
	try {
		const { filter } = parseQueryOptions({ skipLimit: false, ...queryOptions });
		return await CollectionModel.countDocuments(filter);
	} catch (error) {
		logDBError(CollectionModel, 'count', error, queryOptions);
		throw error;
	}
}

async function find(findFunc, CollectionModel, queryOptions) {
	try {
		const { filter, select, populate, skip, limit, sort } = parseQueryOptions(queryOptions);
		const query = CollectionModel[findFunc](filter);

		if (select) query.select(select);
		if (populate) query.populate(populate);
		if (sort) query.sort(sort);
		if (skip) query.skip(skip);
		if (limit || limit === 0) query.limit(limit);

		return await query.exec();
	} catch (error) {
		logDBError(CollectionModel, findFunc || 'find', error, queryOptions);
		throw error;
	}
}

export const findOne = async (...params) => find('findOne', ...params);
export const findMany = async (...params) => find('find', ...params);

export async function insertOne(CollectionModel, documentToInsert) {
	try {
		if (!documentToInsert || Object.keys(documentToInsert).length === 0) {
			throw new Error('Missing Document To Insert');
		}

		const newDocument = new CollectionModel(documentToInsert);
		const insertedDocument = await newDocument.save();
		return insertedDocument;
	} catch (error) {
		// TODO: should we send error in the response or just throw the error?
		// ERROR: Duplication Or Missing Requried Fields
		if (error?.code === 11000 || error?.name === 'ValidationError') {
			throw error;
		}

		logDBError(CollectionModel, 'insertOne', error, { write: documentToInsert });
		throw error;
	}
}

export async function insertMany(CollectionModel, documentsToInsert) {
	try {
		if (!isNonEmptyArray(documentsToInsert)) {
			throw new Error('Missing Documents To Insert');
		}

		const result = await CollectionModel.insertMany(documentsToInsert);
		logger.debug(`${result?.length} documents inserted successfully.`);
		return result;
	} catch (error) {
		logDBError(CollectionModel, 'insertMany', error, { write: documentsToInsert });
		throw error;
	}
}

export async function updateOne(CollectionModel, queryOptions) {
	try {
		const { filter = {}, write, ...restParams } = queryOptions || {};
		const update = parseWriteOperations(write);
		const options = { ...restParams, new: true };

		const updatedDocument = await CollectionModel.findOneAndUpdate(filter, update, options);
		if (updatedDocument) return updatedDocument;
		throw new Error('Document not found or not updated.');
	} catch (error) {
		logDBError(CollectionModel, 'updateOne', error, queryOptions);
		throw error;
	}
}

export async function updateMany(CollectionModel, queryOptions) {
	try {
		const { filter = {}, write, ...restParams } = queryOptions || {};
		const options = { ...restParams, new: true };

		const updatedDocuments = await CollectionModel.updateMany(filter, write, options);
		logger.debug(`${updatedDocuments?.nModified} documents updated successfully.`);
		return updatedDocuments;
	} catch (error) {
		logDBError(CollectionModel, 'updateMany', error, queryOptions);
		throw error;
	}
}

export async function distinct(CollectionModel, queryOptions) {
	try {
		const { fieldName, filter = {} } = queryOptions || {};
		return await CollectionModel.distinct(fieldName, filter);
	} catch (error) {
		logDBError(CollectionModel, 'distinct', error, queryOptions);
		throw error;
	}
}

export async function bulkWrite(CollectionModel, operations, options = {}) {
	try {
		if (!isNonEmptyArray(operations)) {
			throw new Error('Missing Operations To Bulk Write');
		}

		return await CollectionModel.bulkWrite(operations, { ordered: false, ...options });
		// return _.pick(result, [
		// 	'insertedCount',
		// 	'matchedCount',
		// 	'modifiedCount',
		// 	'deletedCount',
		// 	'upsertedCount',
		// ]);
	} catch (error) {
		logDBError(CollectionModel, 'bulkWrite', error, { operationsToExecute: operations?.length });
		throw error;
	}
}

export async function aggregate(CollectionModel, pipeline) {
	try {
		return await CollectionModel.aggregate(pipeline);
	} catch (error) {
		logDBError(CollectionModel, 'aggregate', error, { pipeline });
		throw error;
	}
}
