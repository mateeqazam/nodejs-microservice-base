import fs from 'fs';

import logger from '../logger';
import exportToCSV from '../exportToCSV';
import sendSytemEmail from '../sendSystemEmail';
import { isNonEmptyArray } from '../helpers';
import { getTimestampWithDaysOffset } from '../helpers/date';
import { PRIBOX_SENDER_EMAIL, ADMIN_SUBSCRIBERS } from '../../constants';
import getCampaignEmailAnalytics from '../db-helpers/getCampaignEmailAnalytics';

async function generateCampaignAnalyticsReport() {
	try {
		const timestamp = getTimestampWithDaysOffset(-1);
		const newUpdatedAnalytics = await getCampaignEmailAnalytics(timestamp);
		if (!isNonEmptyArray(newUpdatedAnalytics)) return;

		const filename = timestamp.toDateString();
		await exportToCSV(
			newUpdatedAnalytics,
			['campaignName', 'totalEmails', 'sentEmails', 'campaignStatus'],
			filename
		);

		await sendSytemEmail({
			from: PRIBOX_SENDER_EMAIL,
			to: ADMIN_SUBSCRIBERS.join(','),
			subject: 'Daily Campaign Analytics Update',
			html: `Daily Campaign Analytics Update ${timestamp.toString()}`,
			attachments: [
				{
					Name: `${filename}.csv`,
					Content: fs.readFileSync(`./static/${filename}.csv`).toString('base64'),
					ContentType: 'text/csv',
					ContentID: null,
				},
			],
		});
	} catch (error) {
		const errorMessage = `[generateCampaignAnalyticsReport] Exception: ${error?.message}`;
		logger.error(errorMessage, { error });
	}
}

export default generateCampaignAnalyticsReport;
