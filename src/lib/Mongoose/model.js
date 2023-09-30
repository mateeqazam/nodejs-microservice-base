import mongoose from 'mongoose';
import { isFunction } from 'lodash';

import createSchema from './helpers/createSchema';
import * as Operations from './helpers/operations';

class Model {
	constructor(modelName, schema) {
		const modelSchema = isFunction(schema) ? createSchema(schema) : schema;
		this.model = mongoose.model(modelName, modelSchema);
	}

	async count(...params) {
		return Operations.count(this.model, ...params);
	}

	async findOne(...params) {
		return Operations.findOne(this.model, ...params);
	}

	async findMany(...params) {
		return Operations.findMany(this.model, ...params);
	}

	async insertOne(...params) {
		return Operations.insertOne(this.model, ...params);
	}

	async insertMany(...params) {
		return Operations.insertMany(this.model, ...params);
	}

	async updateOne(...params) {
		return Operations.updateOne(this.model, ...params);
	}

	async updateMany(...params) {
		return Operations.updateMany(this.model, ...params);
	}

	async distinct(...params) {
		return Operations.distinct(this.model, ...params);
	}

	async bulkWrite(...params) {
		return Operations.bulkWrite(this.model, ...params);
	}

	async aggregate(...params) {
		return Operations.aggregate(this.model, ...params);
	}
}

export default Model;
