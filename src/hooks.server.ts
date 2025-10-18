import type { Handle } from '@sveltejs/kit';
import { matchSubdomain } from '$lib/config/subdomains';

export const handle: Handle = async ({ event, resolve }) => {
	const config = matchSubdomain(event.url.hostname);

	event.locals.subdomain = config?.id ?? null;
	event.locals.subdomainConfig = config ?? null;

	if (!config) {
		return resolve(event);
	}

	let injectedAttribute = false;

	return resolve(event, {
		transformPageChunk: ({ html }) => {
			if (injectedAttribute) {
				return;
			}

			if (!html.includes('<html')) {
				return;
			}

			injectedAttribute = true;
			return html.replace('<html', `<html data-app="${config.htmlAttribute}"`);
		}
	});
};
