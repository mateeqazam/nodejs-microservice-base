import CampaignSimulationModel from '../../models/campaignSimulation';

// eslint-disable-next-line import/prefer-default-export
export async function markCampaignSimulationStepAsCompleted(stepItemId, additionalQueryParams) {
	if (!stepItemId) throw new Error('Missing Required Simulation Step Id.');

	const { filter: filterParams, write: writeParams } = additionalQueryParams || {};
	const filter = {
		_id: stepItemId,
		...(filterParams || {}),
		$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
	};
	const write = { $set: { ...(writeParams || {}), status: 'completed' } };
	return CampaignSimulationModel.updateOne({ filter, write });
}
