import express from 'express';

import getSystemEnvVariables from '../controllers/system';

const router = express.Router();

router.get('/ping', (req, res) => res.send('pong'));

router.get('/system/print-env', getSystemEnvVariables);

export default router;
