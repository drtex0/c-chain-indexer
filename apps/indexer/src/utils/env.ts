export const readFromEnv = (envKey: string): string => {
  const env = process.env[envKey];

  if (!env) {
    throw new Error(`"${envKey}" is not defined in env`);
  }

  return env;
};
