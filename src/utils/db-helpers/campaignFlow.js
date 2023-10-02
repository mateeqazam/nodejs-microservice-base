import { isEmpty } from 'lodash';

import CampaignFlowModel from '../../models/campaignFlow';

// eslint-disable-next-line import/prefer-default-export
export async function getCampaignFlowNode(filterParams) {
	if (!filterParams || isEmpty(filterParams)) {
		throw new Error('Missing Required Filter Params');
	}

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

	return CampaignFlowModel.findOne({ filter, select });
}
