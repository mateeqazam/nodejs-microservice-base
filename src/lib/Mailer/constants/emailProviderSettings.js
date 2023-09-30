const MAILBOX_PROVIDERS_SETTINGS = {
	google: {
		smtp: { host: 'smtp.gmail.com', port: 587 },
		imap: { host: 'imap.gmail.com', port: 993 },
	},
	outlook: {
		smtp: { host: 'smtp.office365.com', port: 587 },
		imap: { host: 'outlook.office365.com', port: 993 },
	},
	yahoo: {
		smtp: { host: 'smtp.mail.yahoo.com', port: 587 },
		imap: { host: 'imap.mail.yahoo.com', port: 993 },
	},
	icloud: {
		smtp: { host: 'smtp.mail.me.com', port: 587 },
		imap: { host: 'imap.mail.me.com', port: 993 },
	},
	aol: {
		smtp: { host: 'smtp.aol.com', port: 587 },
		imap: { host: 'imap.aol.com', port: 993 },
	},
	zoho: {
		smtp: { host: 'smtp.zoho.com', port: 587 },
		imap: { host: 'imap.zoho.com', port: 993 },
	},
	yandex: {
		smtp: { host: 'smtp.yandex.ru', port: 587 },
		imap: { host: 'imap.yandex.ru', port: 993 },
	},
	// sendgrid: {
	// 	smtp: { host: 'smtp.sendgrid.net', port: 587 },
	// 	imap: { host: '', port: 993 }
	// },
	// sendinblue: {
	// 	smtp: { host: 'smtp.sendgrid.net', port: 587 },
	// 	imap: { host: 'imap.sendgrid.net', port: 993 }
	// 	// smtp key instead of password
	// },
	// mailgun: {
	// 	smtp: { host: 'smtp.mailgun.org', port: 587 }
	// 	// imap: { host: 'imap.sendgrid.net', port: 993 },
	// },
	// namecheap: {
	// 	smtp: { host: 'mail.privateemail.com', port: 587 },
	// 	imap: { host: 'mail.privateemail.com', port: 993 }
	// },
	amazon_ses: {
		'us-west-2': {
			smtp: { host: 'smtp.mail.us-west-2.awsapps.com', port: 465 },
			imap: { host: 'imap.mail.us-west-2.awsapps.com', port: 993 },
		},
		'us-east-1': {
			smtp: { host: 'smtp.mail.us-east-1.awsapps.com', port: 465 },
			imap: { host: 'imap.mail.us-east-1.awsapps.com', port: 993 },
		},
		'eu-west-1': {
			smtp: { host: 'smtp.mail.eu-west-1.awsapps.com', port: 465 },
			imap: { host: 'imap.mail.eu-west-1.awsapps.com', port: 993 },
		},
	},
};

export default MAILBOX_PROVIDERS_SETTINGS;
