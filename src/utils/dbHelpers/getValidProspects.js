import { isArray, map } from 'lodash';

import logger from '../logger';
import { isNonEmptyArray } from '../helpers';
import ProspectModel from '../../models/prospect';
import ProspectListModel from '../../models/prospectList';

async function getValidProspects(prospectsList) {
	if (!prospectsList) throw new Error('Missing Required Prospects List Ids');

	try {
		const prospectListIds = isArray(prospectsList)
			? [...prospectsList].filter(Boolean)
			: [prospectsList];
		if (!isNonEmptyArray(prospectListIds)) throw new Error('Invalid or Empty Prospects List Ids');

		const pipeline = [
			{
				$match: {
					_id: { $in: map(prospectListIds, 'id') },
					$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
				},
			},
			{
				$lookup: {
					from: ProspectModel.collectionName,
					let: { pid: '$_id' },
					pipeline: [
						{
							$match: {
								$expr: { $eq: ['$prospectListId', '$$pid'] },
								$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
							},
						},
						{ $project: { _id: 1, email: 1, prospectListId: 1 } },
					],
					as: 'prospectRecords',
				},
			},
			{ $unwind: '$prospectRecords' },
			{ $replaceRoot: { newRoot: '$prospectRecords' } },
		];

		const validProspects = await ProspectListModel.aggregate(pipeline);
		return validProspects;
	} catch (error) {
		const errorMessage = `[getValidProspects] Exception: ${error?.message}`;
		logger.dbError(errorMessage, { error, params: { prospectsList } });
		throw error;
	}
}

export default getValidProspects;
