import * as CONFIG from '../config';
import * as MONGO_CONFIG from '../config/mongo';
import * as REDIS_CONFIG from '../config/redis';

function getSystemEnvVariables(req, res, next) {
	try {
		return res.status(200).send({
			success: true,
			data: {
				configurations: {
					...(CONFIG || {}),
					...(MONGO_CONFIG || {}),
					...(REDIS_CONFIG || {}),
					...(process.env || {}),
				},
			},
		});
	} catch (error) {
		return next(error);
	}
}

export default getSystemEnvVariables;
