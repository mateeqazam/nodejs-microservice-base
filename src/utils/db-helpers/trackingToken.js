import log from '../log';
import { isEmpty } from '../helpers';
import TrackingTokenModel from '../../models/trackingToken';

// eslint-disable-next-line import/prefer-default-export
export async function getTrackingTokenRecord(queryParams) {
	try {
		const { filter: filterObj, select, sort } = queryParams || {};
		if (!filterObj || isEmpty(filterObj)) {
			throw new Error('Missing or Empty Filter Params');
		}

		const filter = {
			$or: [{ deletedAt: { $exists: false } }, { deletedAt: null }],
			...(filterObj || {}),
		};

		const result = await TrackingTokenModel.findOne(filter).select(select).sort(sort);
		return { result: result ? result.toObject() : null };
	} catch (error) {
		const errorMessage = `[getTrackingTokenRecord] Exception: ${error?.message}`;
		log.error(errorMessage, { dbError: true, error, queryParams });
		return { error };
	}
}
