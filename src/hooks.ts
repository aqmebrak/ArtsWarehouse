import type { Reroute } from '@sveltejs/kit';
import { matchSubdomain } from '$lib/config/subdomains';

const INTERNAL_PREFIXES = ['/_app', '/_data', '/_svelte_kit', '/service-worker', '/favicon', '/robots'];

function shouldBypass(pathname: string): boolean {
	if (pathname === '/') {
		return false;
	}

	for (const prefix of INTERNAL_PREFIXES) {
		if (pathname.startsWith(prefix)) {
			return true;
		}
	}

	const lastSegment = pathname.split('/').pop();
	if (lastSegment && lastSegment.includes('.')) {
		return true;
	}

	return false;
}

export const reroute: Reroute = ({ url }) => {
	const config = matchSubdomain(url.hostname);
	if (!config) {
		return;
	}

	const pathname = url.pathname;

	if (pathname === config.basePath || pathname.startsWith(`${config.basePath}/`)) {
		return;
	}

	if (shouldBypass(pathname)) {
		return;
	}

	const suffix = pathname === '/' ? '' : pathname;
	return `${config.basePath}${suffix}`;
};
