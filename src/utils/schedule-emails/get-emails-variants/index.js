import logger from '../../logger';
import getVariantsWithCount from '../../db-helpers/getVariantsWithCount';
import { isNonEmptyArray, getEmailVariantCountsMap } from '../../helpers';

async function getEmailsVariants(campaignIds) {
	if (!isNonEmptyArray(campaignIds)) return null;

	try {
		const emailVariants = await getVariantsWithCount({ campaign: { $in: campaignIds } });
		return getEmailVariantCountsMap(emailVariants);
	} catch (error) {
		const errorMessage = `[getEmailsVariants] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { campaignIds } });
		return null;
	}
}

export default getEmailsVariants;
