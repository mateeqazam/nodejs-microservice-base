import { isEmpty } from 'lodash';

import logger from '../logger';
import CampaignFlowModel from '../../models/campaignFlow';

// eslint-disable-next-line import/prefer-default-export
export async function getCampaignFlowNode(filterParams) {
	if (!filterParams || isEmpty(filterParams)) {
		throw new Error('Missing Required Filter Params');
	}

	try {
		const filter = {
			...filterParams,
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
		};

		const select = {
			stepType: 1,
			parentStepType: 1,
			waitDelay: 1,
			triggerDelay: 1,
			campaign: 1,
			tag: 1,
			emailVariants: 1,
			triggerCondition: 1,
		};

		const campaignFlowNode = await CampaignFlowModel.findOne({ filter, select });
		return campaignFlowNode;
	} catch (error) {
		const errorMessage = `[getCampaignFlowNode] Exception: ${error?.message}`;
		logger.dbError(errorMessage, { error, queryParams: { filter: filterParams } });
		throw error;
	}
}
