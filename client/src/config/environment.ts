
type Environment = 'development' | 'production' | 'test';

/**
 * @module config/environment
 * @description Charge les variables d'environnement depuis process.env
 */

const config = {
  NODE_ENV: process.env.NODE_ENV as Environment,
  ENV_TYPE: process.env.NODE_ENV as Environment,
  API_URL: process.env.NEXT_PUBLIC_API_URL! as string,
  DATABASE_URL: process.env.DATABASE_URL as string,
  DICEBEAR_URL: process.env.DICEBEAR_URL as string,
  NEXT_PUBLIC_FRONT_URL: process.env.NEXT_PUBLIC_FRONT_URL as string,
}


export default config;
