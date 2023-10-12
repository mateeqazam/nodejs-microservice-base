import fs from 'fs';
import path from 'path';
import csv from 'fast-csv';

import logger from './logger';

async function exportToCSV(rows, fields, filename) {
	try {
		const exportPath = path.join(__dirname, `/report/${filename}.csv`);
		if (fs.existsSync(exportPath)) fs.unlinkSync(exportPath);

		await new Promise((resolve, reject) => {
			const writeStream = fs.createWriteStream(exportPath);
			const csvStream = csv.writeToStream(writeStream, rows, { headers: fields });

			csvStream
				.on('finish', () => {
					logger.trace(`CSV exported successfully: ${exportPath}`);
					resolve(exportPath);
				})
				.on('error', (error) => reject(error));
		});

		return exportPath;
	} catch (error) {
		const errorMessage = `[exportToCSV] Exception: ${error?.message}`;
		logger.error(errorMessage, { error, params: { fields, filename } });
		throw error;
	}
}

export default exportToCSV;
