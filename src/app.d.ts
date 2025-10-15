import type { AppSubdomain, SubdomainDefinition } from '$lib/config/subdomains';

declare global {
	namespace App {
		interface Locals {
			subdomain: AppSubdomain | null;
			subdomainConfig: SubdomainDefinition | null;
		}

		interface PageData {
			subdomain: AppSubdomain | null;
		}
	}
}

export {};
