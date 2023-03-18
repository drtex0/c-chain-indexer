import { readFromEnv } from './env';

describe('readFromEnv', () => {
  it('returns the environment variable', () => {
    process.env.TEST_VARIABLE = 'test_value';

    const result = readFromEnv('TEST_VARIABLE');

    expect(result).toBe('test_value');
  });

  it('throws an error if specified environment variable is not defined', () => {
    expect(() => readFromEnv('UNDEFINED_VARIABLE')).toThrowError(/"UNDEFINED_VARIABLE" is not defined in env/);
  });
});
