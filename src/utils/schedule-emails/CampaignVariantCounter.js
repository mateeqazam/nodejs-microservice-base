import { get, isEmpty } from 'lodash';

import logger from '../logger';
import { findMinKeyAndValue } from '../helpers';

class CampaignVariantCounter {
	constructor(initialValue = {}) {
		this.value = isEmpty(initialValue) ? {} : { ...initialValue };
	}

	incrementVariantCount({ campaign, campaignFlowNode, variant }) {
		if (!campaign || !campaignFlowNode || !variant) {
			logger.error('[CampaignVariantCounter:incrementVariantCount]  Missing Required Params');
			return;
		}

		this.value[campaign] ||= {};
		this.value[campaign][campaignFlowNode] ||= {};
		this.value[campaign][campaignFlowNode][variant] =
			(this.value[campaign][campaignFlowNode][variant] || 0) + 1;
	}

	getVariantCount({ campaign, campaignFlowNode, variant }) {
		if (!campaign || !campaignFlowNode || !variant) {
			logger.error('[CampaignVariantCounter:getVariantCount] Missing Required Params');
			return 0;
		}

		return this.value[campaign]?.[campaignFlowNode]?.[variant] || 0;
	}

	getVariantWithMinCount({ campaign, campaignFlowNode }) {
		if (!campaign || !campaignFlowNode) {
			logger.error('[CampaignVariantCounter:getVariantWithMinCount] Missing Required Params');
			return null;
		}

		return findMinKeyAndValue(get(this.value, `${campaign}.${campaignFlowNode}`, {}));
	}

	resetValue() {
		this.value = {};
	}
}

export default CampaignVariantCounter;
