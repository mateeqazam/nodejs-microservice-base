import imap from 'imap-simple';
import { find, map } from 'lodash';
import { getIMAPConfig } from './helpers';

class IMAP {
	static async connect({ mailbox, fetchOptions }) {
		const instance = new IMAP();
		instance.connection = await imap.connect({ imap: getIMAPConfig(mailbox) });
		instance.provider = mailbox.provider;
		instance.fetchOptions = fetchOptions;
		return instance;
	}

	async openFolder(folderPath) {
		return this.connection.openBox(folderPath);
	}

	async closeImap() {
		return this.connection.closeBox();
	}

	endImap() {
		return this.connection.end();
	}

	search(searchCriteria, fetchOptions = this.fetchOptions) {
		return this.connection.search(searchCriteria, fetchOptions);
	}

	async moveToInbox(uid) {
		const inboxFolderPath = (await this.getInboxFolder())?.path;
		return this.connection.moveMessage(uid, inboxFolderPath);
	}

	async getUID(messageId, folderPath) {
		const _folderPath = folderPath || (await this.getInboxFolder())?.path;
		await this.openFolder(_folderPath);
		const emails = await this.search([['HEADER', 'Message-ID', messageId]]);
		return emails.length !== 0 ? emails[0].attributes.uid : null;
	}

	markAsImportant(uid) {
		switch (this.provider) {
			case 'google':
				return this.connection.addMessageLabel(uid, '\\Important');
			case 'zoho':
				return this.connection.addFlags(uid, '\\Flagged');
			default:
				return null;
		}
	}

	async markAsStarred(uid) {
		switch (this.provider) {
			case 'google':
				await this.connection.addFlags(uid, '\\Flagged');
				return this.connection.addMessageLabel(uid, '\\Starred');
			default:
				return null;
		}
	}

	async getInboxFolder() {
		if (!this.folders) await this.getFolders();
		if (this.inboxFolder) return this.inboxFolder;

		const labels = ['inbox', 'all mail'];
		const inboxFolder = find(
			map(labels, (label) => find(this.folders, (item) => item?.label?.toLowerCase() === label)),
			(folder) => folder !== undefined
		);

		if (inboxFolder) {
			this.inboxFolder = inboxFolder;
			return inboxFolder;
		}

		return null;
	}

	async getPriboxFolder() {
		if (!this.folders) await this.getFolders();
		if (this.priboxFolder) return this.priboxFolder;

		const labels = ['pribox'];
		const priboxFolder = find(
			map(labels, (label) => find(this.folders, (item) => item?.label?.toLowerCase() === label)),
			(folder) => folder !== undefined
		);

		if (priboxFolder) {
			this.priboxFolder = priboxFolder;
			return priboxFolder;
		}

		return null;
	}

	async getSentFolder() {
		if (!this.folders) await this.getFolders();

		const sentFlaggedFolder = this.folders.find((folder) =>
			folder.attributes.map((attr) => attr.toLowerCase()).includes('\\sent')
		);
		if (sentFlaggedFolder) return sentFlaggedFolder;

		const sentFolder = this.folders.find((item) => item.label.toLowerCase().includes('sent'));
		return sentFolder || null;
	}

	async getSpamFolder() {
		if (!this.folders) await this.getFolders();

		const junkFlaggedFolder = this.folders.find((folder) =>
			folder.attributes.map((attr) => attr.toLowerCase()).includes('\\junk')
		);
		if (junkFlaggedFolder) return junkFlaggedFolder;

		const labels = ['spam', 'junk', 'bulk mail'];
		const spamFolder = find(
			map(labels, (label) => find(this.folders, (item) => item?.label?.toLowerCase() === label)),
			(folder) => folder !== undefined
		);

		return spamFolder;
	}

	async deleteMessage(uids) {
		return this.connection.deleteMessage(uids);
	}

	async readMessag(uid) {
		return this.connection.addFlags(uid, '\\Seen');
	}

	async getFolders() {
		const boxes = await this.connection.getBoxes();
		const folders = [];

		Object.keys(boxes).forEach((box) => {
			if (!boxes[box].attribs.find((v) => v.toLowerCase() === '\\noselect')) {
				folders.push({ label: box, path: box, attributes: boxes[box].attribs });
			}

			if (boxes[box].children) {
				folders.push(
					...Object.keys(boxes[box].children).map((child) => ({
						label: child,
						path: `${box}${boxes[box]?.delimiter || '/'}${child}`,
						attributes: boxes[box].children[child].attribs,
					}))
				);
			}
		});

		this.folders = folders;
		return this.folders;
	}
}

export default IMAP;
