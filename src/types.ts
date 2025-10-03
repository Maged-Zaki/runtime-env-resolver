export interface ResolverProvider {
	/**
	 *
	 * @param value The env variable value to check if it should resolved or not
	 * @description This function will be called with each env variable value to check if it should be resolved or not
	 */
	shouldResolve(value: string): boolean;
	/**
	 *
	 * @param values The array of variable values to resolve
	 * @returns the resolved values in the same order
	 */
	resolve(values: string[]): Promise<string[]>;
}

export interface Logger {
	/**
	 * Log an error message
	 */
	error(message: string): void;
	/**
	 * Log a warning message
	 */
	warn(message: string): void;
	/**
	 * Log an info message
	 */
	info(message: string): void;
	/**
	 * Log a debug message
	 */
	debug(message: string): void;
}

export interface ResolveEnvOptions {
	/**
	 * enable/disable logging. Defaults to `true`
	 */
	logging?: boolean;
	/**
	 * Custom logger instance. If not provided, a default console logger will be used.
	 */
	logger?: Logger;
}
