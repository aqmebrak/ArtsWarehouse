import { env } from '$env/dynamic/public';

export const SUBDOMAIN_IDS = ['audio-training', 'recipes', 'sbt', 'tellurichymn'] as const;

export type AppSubdomain = (typeof SUBDOMAIN_IDS)[number];

export interface SubdomainDefinition {
	readonly id: AppSubdomain;
	readonly basePath: `/${string}`;
	readonly htmlAttribute: string;
	readonly hosts: readonly string[];
}

const BASE_DOMAIN = env.PUBLIC_BASE_DOMAIN?.toLowerCase();

function readHostOverrides(id: AppSubdomain): string[] {
	const key = `PUBLIC_${id.replace(/-/g, '_').toUpperCase()}_HOSTS`;
	const raw = env[key];
	if (!raw) return [];
	return raw
		.split(',')
		.map((value) => value.trim().toLowerCase())
		.filter((value) => value.length > 0);
}

function buildHosts(id: AppSubdomain): string[] {
	const hosts = new Set<string>();

	if (BASE_DOMAIN && BASE_DOMAIN.length > 0) {
		hosts.add(`${id}.${BASE_DOMAIN}`);
	}

	hosts.add(`${id}.localhost`);
	hosts.add(id);
	hosts.add(`${id}.127.0.0.1.nip.io`);

	for (const host of readHostOverrides(id)) {
		hosts.add(host);
	}

	return Array.from(hosts);
}

const SUBDOMAIN_DEFINITIONS: Record<AppSubdomain, SubdomainDefinition> = {
	'audio-training': {
		id: 'audio-training',
		basePath: '/audio-training',
		htmlAttribute: 'audio-training',
		hosts: buildHosts('audio-training')
	},
	recipes: {
		id: 'recipes',
		basePath: '/recipes',
		htmlAttribute: 'recipes',
		hosts: buildHosts('recipes')
	},
	sbt: {
		id: 'sbt',
		basePath: '/sbt',
		htmlAttribute: 'sbt',
		hosts: buildHosts('sbt')
	},
	tellurichymn: {
		id: 'tellurichymn',
		basePath: '/tellurichymn',
		htmlAttribute: 'tellurichymn',
		hosts: buildHosts('tellurichymn')
	}
};

const SUBDOMAIN_LIST = Object.values(SUBDOMAIN_DEFINITIONS);

function matchesPreviewHost(hostname: string, id: AppSubdomain): boolean {
	return (
		hostname.startsWith(`${id}-`) &&
		(hostname.endsWith('.vercel.app') || (BASE_DOMAIN && hostname.endsWith(`.${BASE_DOMAIN}`)))
	);
}

function matchesLocalhostSubdomain(hostname: string, id: AppSubdomain): boolean {
	if (!hostname.endsWith('.localhost')) return false;
	const candidate = hostname.slice(0, -'.localhost'.length);
	return candidate === id;
}

export function getSubdomainConfig(id: AppSubdomain): SubdomainDefinition {
	return SUBDOMAIN_DEFINITIONS[id];
}

export function matchSubdomain(hostname: string): SubdomainDefinition | null {
	const normalized = hostname.toLowerCase();

	if (!normalized || normalized === 'localhost' || normalized === '127.0.0.1') {
		return null;
	}

	for (const config of SUBDOMAIN_LIST) {
		if (config.hosts.includes(normalized)) {
			return config;
		}

		if (matchesPreviewHost(normalized, config.id)) {
			return config;
		}

		if (matchesLocalhostSubdomain(normalized, config.id)) {
			return config;
		}

		if (BASE_DOMAIN && normalized.endsWith(`.${BASE_DOMAIN}`)) {
			const prefix = normalized.slice(0, -(BASE_DOMAIN.length + 1));
			if (prefix === config.id) {
				return config;
			}
		}
	}

	return null;
}

export function isKnownSubdomain(id: string): id is AppSubdomain {
	return (SUBDOMAIN_IDS as readonly string[]).includes(id);
}

export function listSubdomains(): SubdomainDefinition[] {
	return SUBDOMAIN_LIST;
}
