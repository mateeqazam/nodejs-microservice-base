import scheduleCronJob from '../utils/scheduleCronJob';
import generateCampaignAnalyticsReport from '../utils/campaign-analytics/generatreReport';

function generateCampaignAnalyticsReportCronJob() {
	// every midnight
	scheduleCronJob('0 0 0 * * *', {
		title: 'generateCampaignAnalyticsReport',
		func: generateCampaignAnalyticsReport,
	});
}

export default generateCampaignAnalyticsReportCronJob;
