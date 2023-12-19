import express from 'express';

import systemRoutes from './system';

const router = express.Router();

router.get('/ping', (_, res) => res.send('pong'));

router.use('/system', systemRoutes);

export default router;
