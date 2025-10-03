import type { ResolveEnvOptions, ResolverProvider } from './types.js';
import { ConsoleLogger } from './logger';

/**
 * Resolve environment variables using the given provider.
 *
 * Mutates `process.env` and also returns an object of resolved values.
 *
 * @param provider The resolver provider to use for resolving environment variables.
 * @param options Optional settings for the resolver
 * @returns An object containing the resolved environment variables
 */

export async function resolveEnvVariables(provider: ResolverProvider, options: ResolveEnvOptions = {}): Promise<Record<string, string>> {
	const { logging = true, logger = new ConsoleLogger() } = options;

	// Collect keys and values that need resolution
	const resolvableKeys: string[] = [];
	const resolvableValues: string[] = [];

	for (const key of Object.keys(process.env)) {
		const value = process.env[key];

		if (!value) {
			continue;
		}

		if (!provider.shouldResolve(value)) {
			continue;
		}

		resolvableKeys.push(key);
		resolvableValues.push(value);
	}

	// Nothing to resolve
	if (resolvableKeys.length === 0 && logging) {
		logger.info('No environment variables needed resolution.');
		return {};
	}

	// Resolve values
	const resolvedValues = await provider.resolve(resolvableValues);

	// Build result and mutate process.env
	const resolvedObj: Record<string, string> = {};

	for (let i = 0; i < resolvableKeys.length; i++) {
		const key = resolvableKeys[i];
		const resolvedValue = resolvedValues[i];

		process.env[key] = resolvedValue;
		resolvedObj[key] = resolvedValue;
	}

	if (logging) {
		logger.info(`Resolved ${resolvableKeys.length} environment variable(s): ${resolvableKeys.join(', ')}`);
	}

	return resolvedObj;
}
