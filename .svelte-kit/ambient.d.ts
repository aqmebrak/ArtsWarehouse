
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const COLORTERM: string;
	export const COMMAND_MODE: string;
	export const DEBUG_COLORS: string;
	export const FIG_PID: string;
	export const FIG_SET_PARENT: string;
	export const FIG_SET_PARENT_CHECK: string;
	export const FORCE_COLOR: string;
	export const HOME: string;
	export const IDEA_INITIAL_DIRECTORY: string;
	export const LC_CTYPE: string;
	export const LC_FIG_SET_PARENT: string;
	export const LESS: string;
	export const LOGNAME: string;
	export const LSCOLORS: string;
	export const LS_COLORS: string;
	export const MOCHA_COLORS: string;
	export const NODE_ENV: string;
	export const OLDPWD: string;
	export const P9K_SSH: string;
	export const PAGER: string;
	export const PATH: string;
	export const PWD: string;
	export const SHELL: string;
	export const SSH_AUTH_SOCK: string;
	export const TMPDIR: string;
	export const TTY: string;
	export const USER: string;
	export const VOLTA_HOME: string;
	export const XPC_FLAGS: string;
	export const XPC_SERVICE_NAME: string;
	export const YSU_VERSION: string;
	export const ZSH: string;
	export const _P9K_SSH_TTY: string;
	export const _VOLTA_TOOL_RECURSION: string;
	export const __CFBundleIdentifier: string;
	export const __CF_USER_TEXT_ENCODING: string;
	export const npm_config_color: string;
}

/**
 * Similar to [`$env/static/private`](https://kit.svelte.dev/docs/modules#$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/master/packages/adapter-node) (or running [`vite preview`](https://kit.svelte.dev/docs/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://kit.svelte.dev/docs/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		COLORTERM: string;
		COMMAND_MODE: string;
		DEBUG_COLORS: string;
		FIG_PID: string;
		FIG_SET_PARENT: string;
		FIG_SET_PARENT_CHECK: string;
		FORCE_COLOR: string;
		HOME: string;
		IDEA_INITIAL_DIRECTORY: string;
		LC_CTYPE: string;
		LC_FIG_SET_PARENT: string;
		LESS: string;
		LOGNAME: string;
		LSCOLORS: string;
		LS_COLORS: string;
		MOCHA_COLORS: string;
		NODE_ENV: string;
		OLDPWD: string;
		P9K_SSH: string;
		PAGER: string;
		PATH: string;
		PWD: string;
		SHELL: string;
		SSH_AUTH_SOCK: string;
		TMPDIR: string;
		TTY: string;
		USER: string;
		VOLTA_HOME: string;
		XPC_FLAGS: string;
		XPC_SERVICE_NAME: string;
		YSU_VERSION: string;
		ZSH: string;
		_P9K_SSH_TTY: string;
		_VOLTA_TOOL_RECURSION: string;
		__CFBundleIdentifier: string;
		__CF_USER_TEXT_ENCODING: string;
		npm_config_color: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://kit.svelte.dev/docs/modules#$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://kit.svelte.dev/docs/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
