import log from './log';
import { postRequest } from './request';
import { PRIBOX_CAMPAIGN_SIMULATOR_HOST, PRIBOX_TRACKER_HEADER_TOKEN } from '../config';

async function notifyCampaignSimulator(data) {
	try {
		const reqOptions = { headers: { authorization: PRIBOX_TRACKER_HEADER_TOKEN }, data };
		const endPointURL = `${PRIBOX_CAMPAIGN_SIMULATOR_HOST}/email-engagment`;
		const { error } = await postRequest(endPointURL, reqOptions);
		if (error) throw new Error(error);

		return { success: true, notified: true };
	} catch (error) {
		const errorMessage = `[notifyCampaignSimulator] Exception: ${error?.message}`;
		log.error(errorMessage, { error, data });
		return { error };
	}
}

export default notifyCampaignSimulator;
