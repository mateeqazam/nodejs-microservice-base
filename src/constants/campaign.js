export const CAMPAIGN_STATUSES = {
	DRAFT: 'draft',
	READY: 'ready',
	ACTIVE: 'active',
	PAUSED: 'paused',
	COMPLETED: 'completed',
};

export const CONFIG_SENDTO_OPTIONS = {
	ALL: 'all',
	FIRST: 'first',
};

export const CONFIG_MISSING_VARIABLES_CASES = {
	SEND_ANYWAY: 'send anyway',
	SEND_TO_CHECKLIST: 'send to checklist',
};

export const FLOW_NODE_TYPES = {
	START: 'start',
	EMAIL: 'email',
	DELAY: 'delay',
	TRIGGER: 'trigger',
	GOAL: 'goal',
};

export const TRIGGER_NODE_VARIANTS = { YES: 'yes', NO: 'no', DEFAULT: 'default' };
export const TRIGGER_CONDITIONS = { OPENED: 'opened', CLICKED: 'clicked', BOOKED: 'booked' };

export const EMAIL_EVENTS = {
	EMAIL_OPENED: 'email_opened',
	LINK_CLICKED: 'link_clicked',
	UNSUBSCRIBED: 'unsubscribed',
};

export const SIMULATION_STEP_STATUSES = {
	ACTIVE: 'active',
	COMPLETED: 'completed',
	FAILED: 'failed',
};


export const CAMPAIGN_EMAIL_QUEUE_STATUSES = {
	ACTIVE: 'active',
	QUEUED: 'queued',
	PAUSED: 'paused',
	COMPLETED: 'completed',
	
	FAILED: 'failed',
}
