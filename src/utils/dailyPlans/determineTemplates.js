import promiseLimit from 'promise-limit';
import { filter, find, forEach, map, uniq } from 'lodash';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import { ObjectId } from '../../lib/Mongoose/constants';
import EmailTemplateModel from '../../models/emailTemplate';
import { randomChunk, getRandomIntFromRange } from '../helpers/random';
import EmailTemplatePriorityModel from '../../models/emailTemplatePriority';

async function findReceiverTemplate(receiver, templates) {
	const result = { receiver };
	if (!receiver || !isNonEmptyArray(templates)) return result;

	try {
		const receiverTemplatesPriorities = await EmailTemplatePriorityModel.find({
			filter: {
				receiver: ObjectId(receiver),
				deletedAt: { $exists: false },
			},
			select: { template: 1, priority: 1 },
			skipLimit: true,
		});
		// if (!isNonEmptyArray(receiverTemplatesPriorities)) return result;

		const receiverTemplatesPrioritiesObj = {};
		forEach(receiverTemplatesPriorities, (templatePriority = {}) => {
			receiverTemplatesPrioritiesObj[templatePriority.template] = templatePriority.priority;
		});

		const aggregatedTemplatePrioritiesObj = {};
		let templateWithMinAggregatedPriorityObj = null;
		forEach(templates, (template = {}) => {
			let aggregatedTemplatePriority = template.priority || 0;

			if (receiverTemplatesPrioritiesObj[template._id]) {
				aggregatedTemplatePriority += receiverTemplatesPrioritiesObj[template._id].priority || 0;
			}

			aggregatedTemplatePrioritiesObj[template._id] = aggregatedTemplatePriority;

			if (
				!templateWithMinAggregatedPriorityObj ||
				templateWithMinAggregatedPriorityObj.priority > aggregatedTemplatePriority ||
				(templateWithMinAggregatedPriorityObj.priority === aggregatedTemplatePriority &&
					getRandomIntFromRange(0, 1))
			) {
				templateWithMinAggregatedPriorityObj = {
					template: template._id,
					priority: aggregatedTemplatePriority,
				};
			}
		});

		if (!templateWithMinAggregatedPriorityObj || !templateWithMinAggregatedPriorityObj.template) {
			return result;
		}

		const templateWithMinAggregatedPriority = templateWithMinAggregatedPriorityObj.template;
		await Promise.all([
			EmailTemplateModel.updateOne({
				filter: { _id: ObjectId(templateWithMinAggregatedPriority) },
				write: { $inc: { priority: 1 } },
			}),
			EmailTemplatePriorityModel.updateOne({
				filter: {
					template: ObjectId(templateWithMinAggregatedPriority),
					receiver: ObjectId(receiver),
				},
				write: { $inc: { priority: 1 } },
				upsert: true,
			}),
		]);

		return { ...result, template: templateWithMinAggregatedPriority };
	} catch (error) {
		const errorMessage = `[findReceiverTemplate] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { receiver, templates } });
		return result;
	}
}

async function determineReceiversTemplates(sender, receivers, additionalParams) {
	const result = [];

	try {
		if (!sender || !isNonEmptyArray(receivers)) return result;

		const { responsiveTemplate } = additionalParams || {};
		const templates = await EmailTemplateModel.find({
			filter: {
				active: true,
				parent: null,
				child: responsiveTemplate ? { $ne: null } : null,
				deletedAt: { $exists: false },
			},
			select: { _id: 1, priority: 1 },
			skipLimit: true,
		});

		const receiverIds = uniq(map(receivers, '_id'));
		const pLimit = promiseLimit(1);
		const receiversTemplates = await Promise.all(
			receiverIds.map((receiverId) => pLimit(() => findReceiverTemplate(receiverId, templates)))
		);

		forEach(receiversTemplates, (receiverTemplate = {}) => {
			if (!receiverTemplate || !receiverTemplate.template) {
				if (receiverTemplate.receiver) {
					logger.debug('Unable to determine templates', {
						sender,
						receiver: receiverTemplate.receiver,
					});
				}
			}

			result.push({
				sender: sender._id,
				receiver: receiverTemplate.receiver,
				template: receiverTemplate.template,
			});
		});

		return result;
	} catch (error) {
		const errorMessage = `[determineReceiversTemplates] Exception: ${error?.message}`;
		logger.error(errorMessage, {
			error,
			params: { sender, receivers, ...(additionalParams || {}) },
		});
		return result;
	}
}

async function determineTemplates(sender, receivers) {
	try {
		if (!sender || !isNonEmptyArray(receivers)) return null;

		const testerReceivers = [];
		const nonTesterReceivers = [];

		forEach(receivers, (receiver) => {
			// if (!receiver.isWarmUp) testerReceivers.push(receiver);
			if (receiver.isWarmUp) nonTesterReceivers.push(receiver);
		});

		const totalNonResponsiveReceivers = Math.ceil(
			(getRandomIntFromRange(10, 45) / 100) * receivers.length
		);

		const nonResponsiveReceivers = [
			...testerReceivers,
			...randomChunk(nonTesterReceivers, totalNonResponsiveReceivers - testerReceivers.length),
		];

		const responsiveReceivers = filter(receivers, (receiver) =>
			find(nonResponsiveReceivers, { _id: receiver._id })
		);

		const [responsiveTemplates, nonResponsiveTemplates] = await Promise.all([
			determineReceiversTemplates(sender, responsiveReceivers, {
				responsiveTemplate: true,
			}),
			determineReceiversTemplates(sender, nonResponsiveReceivers, {
				responsiveTemplate: false,
			}),
		]);

		const result = [...(responsiveTemplates || []), ...(nonResponsiveTemplates || [])];
		if (!isNonEmptyArray(result)) return result;

		return result;
	} catch (error) {
		const errorMessage = `[determineTemplates] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { sender, receivers } });
		return null;
	}
}

export default determineTemplates;
