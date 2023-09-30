import { isNonEmptyArray } from './helpers';

const SIGN_ICONS = {
	warn: '⚠️',
	error: '❌',
	danger: '❗☠️',
};

function logWithStackTrace(sign, ...params) {
	try {
		if (!isNonEmptyArray(params)) return;

		const [errorMessage, { error } = {}] = params;
		if (!errorMessage) return;

		let logFunc = console[sign] || console.log;
		if (sign === 'trace' || sign === 'debug' || sign === 'info') logFunc = console.log;

		const signIcon = SIGN_ICONS[sign] || '';
		const logMessage = `\n${signIcon} ${errorMessage}`.trim();
		const logData = params && params[1] ? JSON.stringify(params[1]) : null;
		logFunc(logMessage, logData);

		if (error && error.stack && !(sign === 'trace' || sign === 'debug' || sign === 'info')) {
			const relevantStackLines = error.stack
				.split('\n')
				.filter((line) => line.includes('at '))
				.map((line) => `  ${line.trim()}`)
				.join('\n');

			logFunc('STACK TRACE:', relevantStackLines);

			/* Uncomment this code if you want to shorten file paths in the stack trace
      const shortenedStackLines = error.stack
        .split('\n')
        .map(line => {
          const match = line.match(/\(([^)]+)\)/);
          if (match) {
            const filePath = match[1];
            const parts = filePath.split('/');
            return parts.slice(-4).join('/');
          }
          return line;
        });
      
      console.error(shortenedStackLines.join('\n'));
      */
		}
	} catch (error) {
		console.error('[logWithStackTrace] Exception', error?.message);
	}
}

const log = {
	trace: (...params) => logWithStackTrace('trace', ...params),
	debug: (...params) => logWithStackTrace('debug', ...params),
	info: (...params) => logWithStackTrace('info', ...params),
	warn: (...params) => logWithStackTrace('warn', ...params),
	error: (...params) => logWithStackTrace('error', ...params),
	fatal: (...params) => logWithStackTrace('fatal', ...params),
};

export default log;
