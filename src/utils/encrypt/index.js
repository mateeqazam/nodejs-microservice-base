import { encrypt, decrypt } from './encryption';

export function getEncryptedPassword(password) {
	if (!password) return password;
	return Buffer.from(JSON.stringify(encrypt(password))).toString('base64');
}

export function getDecryptedPassword(encryptedPassword) {
	return decrypt(JSON.parse(Buffer.from(encryptedPassword, 'base64').toString('ascii')));
}
