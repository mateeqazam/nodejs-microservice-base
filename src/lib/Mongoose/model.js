import mongoose from 'mongoose';

import createSchema from './helpers/createSchema';
import * as Operations from './helpers/operations';

class Model {
	constructor(modelName, schema) {
		const modelSchema = schema instanceof mongoose.Schema ? schema : createSchema(schema);
		this.name = modelName;
		this.model = mongoose.model(modelName, modelSchema);
		this.collectionName = this.model?.collection?.name;
	}

	async count(...params) {
		return Operations.count(this.model, ...params);
	}

	async findOne(...params) {
		return Operations.findOne(this.model, ...params);
	}

	async find(...params) {
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

	async update(...params) {
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
