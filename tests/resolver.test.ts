import { resolveEnvVariables } from '../src/resolver';
import type { ResolverProvider, Logger } from '../src/types';

describe('Resolver', () => {
	const store = {
		dbPassword: 'sensitive_pass',
		connectionString: 'sensitive_connection_string',
		redisPassword: 'sensitive_redis_password',
	};

	const provider: ResolverProvider = {
		resolve: async (values: string[]) => {
			return values.map((v) => {
				const noPrefix = v.replace('remoteVar:', '');

				return store[noPrefix as keyof typeof store];
			});
		},
		shouldResolve: (value: string) => {
			return value.startsWith('remoteVar');
		},
	};

	const mockLogger: Logger = {
		error: jest.fn(),
		warn: jest.fn(),
		info: jest.fn(),
		debug: jest.fn(),
	};

	beforeEach(() => {
		process.env = {
			NON_SENSITIVE_VAR: 'non-sensitive',
			DB_PASSWORD: 'remoteVar:dbPassword',
			CONNECTION_STRING: 'remoteVar:connectionString',
			NON_SENSITIVE_VAR2: 'non-sensitive2',
			REDIS_PASSWORD: 'remoteVar:redisPassword',
		};
	});

	it('should resolve variables', async () => {
		await resolveEnvVariables(provider);

		expect(process.env.NON_SENSITIVE_VAR).toBe('non-sensitive');
		expect(process.env.DB_PASSWORD).toBe(store.dbPassword);
		expect(process.env.CONNECTION_STRING).toBe(store.connectionString);
		expect(process.env.NON_SENSITIVE_VAR2).toBe('non-sensitive2');
		expect(process.env.REDIS_PASSWORD).toBe(store.redisPassword);
	});

	it('should use custom logger when provided', async () => {
		await resolveEnvVariables(provider, { logger: mockLogger });

		expect(mockLogger.info).toHaveBeenCalledWith('Resolved 3 environment variable(s): DB_PASSWORD, CONNECTION_STRING, REDIS_PASSWORD');
	});

	it('should disable logging when logging is false', async () => {
		jest.resetAllMocks();

		await resolveEnvVariables(provider, { logging: false, logger: mockLogger });

		expect(mockLogger.info).not.toHaveBeenCalled();
	});
});
