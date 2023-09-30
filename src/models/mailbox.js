import Model from '../lib/Mongoose/model';
import DB_COLLECTIONS from '../constants/dbCollections';
import { getEncryptedPassword } from '../utils/encryption';
import createSchema from '../lib/Mongoose/helpers/createSchema';
import { String, Date, Boolean, ObjectId } from '../lib/Mongoose/constants';

const mailboxSchema = createSchema({
	firstName: {
		type: String,
		required: true,
	},
	lastName: String,
	email: {
		type: String,
		index: true,
		lowercase: true,
		required: true,
	},
	password: String,
	isDomainCheck: Boolean,
	isDomain: {
		isDmarc: Boolean,
		isBlackList: Boolean,
		isDkim: Boolean,
	},
	senderName: String,
	signature: String,
	config: {
		messagePerDay: Number,
		fixedDelay: Number,
		randomDelay: {
			from: Number,
			to: Number,
		},
		bcc: String,
		customTrackingDomain: String,
	},
	provider: {
		type: String,
		default: 'custom',
	},
	isWarmUp: {
		type: Boolean,
		default: false,
	},
	social: {
		userId: String,
		accessToken: String,
		refreshToken: String,
		expiresAt: Date,
	},
	smtp: {
		username: String,
		password: String,
		host: String,
		port: Number,
		security: {
			type: String,
			enum: ['ssl/tls', 'insecure', null],
		},
	},
	imap: {
		username: String,
		password: String,
		host: String,
		port: Number,
		security: {
			type: String,
			enum: ['ssl/tls', 'insecure', null],
		},
	},
	tags: [String],
	status: {
		type: String,
		enum: ['active', 'inactive', 'suspended'],
		default: 'active',
	},
	timezoneOffset: {
		type: Number,
		default: 0,
	},
	suspendedAt: Date,
	suspendedRaw: Object,
	owner: {
		type: ObjectId,
		ref: DB_COLLECTIONS.user,
	},
	receivingPriority: {
		type: Number,
		default: 0,
	},
	bulkCreated: {
		type: Boolean,
		default: false,
	},
	isOurs: {
		type: Boolean,
		default: false,
	},
});

mailboxSchema.pre('save', function encryptPasswords(next) {
	if (this.isModified('password')) {
		this.password = getEncryptedPassword(this.password);
	}
	if (this.isModified('smtp.password')) {
		this.smtp.password = getEncryptedPassword(this.smtp.password);
	}
	if (this.isModified('imap.password')) {
		this.imap.password = getEncryptedPassword(this.imap.password);
	}
	next();
});

mailboxSchema.index({ email: 'text' });

const MailboxModel = new Model(DB_COLLECTIONS.mailbox, mailboxSchema);

export default MailboxModel;
