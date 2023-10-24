import { pick } from 'lodash';

import { isNonEmptyArray } from '../../../utils/helpers';

import logDBError from './logDBError';
import { parseQueryOptions, parseWriteOperations } from './parsers';

export async function count(CollectionModel, queryOptions) {
	try {
		const { filter } = parseQueryOptions({ skipLimit: false, ...queryOptions });
		return CollectionModel.countDocuments(filter);
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

		return query.exec();
	} catch (error) {
		logDBError(CollectionModel, findFunc || 'find', error, queryOptions);
		throw error;
	}
}

export const findOne = async (...params) => find('findOne', ...params);
export const findMany = async (...params) => find('find', ...params);

export const findById = async (CollectionModel, docId, params = {}, ...restParams) => {
	if (!docId) throw new Error('Missing Required Id.');

	const filter = { ...(params?.filter || {}), _id: docId };
	return findOne(CollectionModel, { ...(params || {}), filter }, ...restParams);
};

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

		return CollectionModel.insertMany(documentsToInsert);
	} catch (error) {
		logDBError(CollectionModel, 'insertMany', error, { write: documentsToInsert });
		throw error;
	}
}

export async function updateOne(CollectionModel, queryOptions) {
	try {
		const { filter = {}, write, ignoreDocumentNotFound, ...restParams } = queryOptions || {};
		const update = parseWriteOperations(write);
		const options = { ...restParams, new: true };

		const updatedDocument = await CollectionModel.findOneAndUpdate(filter, update, options);
		if (updatedDocument) return updatedDocument;
		if (!ignoreDocumentNotFound) throw new Error('Document not found or not updated.');
		return null;
	} catch (error) {
		logDBError(CollectionModel, 'updateOne', error, queryOptions);
		throw error;
	}
}

export async function updateMany(CollectionModel, queryOptions) {
	try {
		const { filter = {}, write, ...restParams } = queryOptions || {};
		const update = parseWriteOperations(write);
		const options = { ...restParams, new: true };

		return CollectionModel.updateMany(filter, update, options);
	} catch (error) {
		logDBError(CollectionModel, 'updateMany', error, queryOptions);
		throw error;
	}
}

export async function distinct(CollectionModel, queryOptions) {
	try {
		const { fieldName, filter = {} } = queryOptions || {};
		return CollectionModel.distinct(fieldName, filter);
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

		const result = CollectionModel.bulkWrite(operations, { ordered: false, ...options });
		return pick(result, [
			'insertedCount',
			'matchedCount',
			'modifiedCount',
			'deletedCount',
			'upsertedCount',
		]);
	} catch (error) {
		logDBError(CollectionModel, 'bulkWrite', error, { operationsToExecute: operations?.length });
		throw error;
	}
}

export async function aggregate(CollectionModel, pipeline) {
	try {
		return CollectionModel.aggregate(pipeline);
	} catch (error) {
		logDBError(CollectionModel, 'aggregate', error, { pipeline });
		throw error;
	}
}
