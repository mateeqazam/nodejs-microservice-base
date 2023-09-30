import log from '../../../../utils/log';

async function sendEmailViaSMTP(client, mailOptions) {
	try {
		const result = await client.sendMail(mailOptions);
		return { result };
	} catch (error) {
		const errorMessage = `[sendEmailViaSMTP] Exception: ${error?.message}`;
		log.fatal(errorMessage, { error, data: { client, mailOptions } });
		return { error };
	}
}

export default sendEmailViaSMTP;
