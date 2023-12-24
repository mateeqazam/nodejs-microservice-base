import express from 'express';

import serverAdapter from '../dashboard';
import { BULLMQ_DASHBOARD_ENDPOINT } from '../constants';
import sysAdminAuthMiddleware from '../middlewares/sysAdminAuth';

import { getSystemEnvVariables } from '../controllers/system';

const systemRoutes = express.Router();

systemRoutes.get('/app-env', sysAdminAuthMiddleware, getSystemEnvVariables);

systemRoutes.use(
	BULLMQ_DASHBOARD_ENDPOINT?.replace('/system', ''),
	sysAdminAuthMiddleware,
	serverAdapter.getRouter()
);

export default systemRoutes;
