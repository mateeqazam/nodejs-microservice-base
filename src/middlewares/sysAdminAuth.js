import basicAuth from 'express-basic-auth';

import { IS_DEV } from '../config';

const sysAdminAuthMiddleware = basicAuth({
	users: { admin: process.env.SYSTEM_ADMIN_PASSWORD },
	challenge: true,
	realm: 'Imb4T3st4pp',
});

export default !IS_DEV ? sysAdminAuthMiddleware : (req, res, next) => next();
