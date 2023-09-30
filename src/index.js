import 'dotenv/config';
import 'isomorphic-fetch';

import app from './app';
import runCrons from './crons';
import appRoutes from './routes';
import { ENV, PORT } from './config';
import serverAdapter from './dashboard';
import connectMongoDatabase from './services/MongoDB/connection';

(async () => {
	try {
		const { err: mongoConnectionErr } = await connectMongoDatabase();
		if (mongoConnectionErr) throw new Error(mongoConnectionErr);

		runCrons();

		app.use('/admin/queues', serverAdapter.getRouter());

		app.use('/', appRoutes);
		app.use((req, res) =>
			res.status(404).json({
				message: `${req.protocol}://${req.get('host')}${req.originalUrl}: not a Valid Path!`,
			})
		);

		// @Note: All the Errors caught in base middleware will be of critical type;
		app.use((error, req, res) =>
			// log error
			res.status(500).json({ message: error?.message || error || 'Something went wrong!' })
		);

		await app.listen(PORT);
		console.info(`Server started on port ${PORT} (ENV: ${ENV})`);

		// process.on('uncaughtException', async (err, origin) => {
		// 	// log error
		// 	console.error(`Caught exception: ${err}\n Exception origin: ${origin}`);
		// 	process.exit(1);
		// });

		// process.on('unhandledRejection', async (reason, promise) => {
		// 	// log error
		// 	console.error(`Unhandled Rejection at: ${promise} Reason: ${reason}`);
		// 	process.exit(1);
		// });

		// process.once('SIGUSR2', () => {
		// 	process.kill(process.pid, 'SIGUSR2');
		// });

		// process.on('SIGINT', () => {
		// 	// this is only called on ctrl+c, not restart
		// 	process.kill(process.pid, 'SIGINT');
		// });
	} catch (error) {
		// log error
		console.error('Server Error', error?.message);
		process.exit(1);
	}
})();
