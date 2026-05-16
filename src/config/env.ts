import dotenv from 'dotenv';
import Joi from 'joi';

// Load correct env file
const ENV = process.env.NODE_ENV || 'local';

// Load env-specific file first
dotenv.config({
  path: `.env.${ENV}`,
});

// Only load local overrides outside docker/prod
if (ENV === 'local') {
  dotenv.config({
    path: `.env.local`,
  });
}

// Validation schema
const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('local', 'development', 'production', 'test').required(),

  PORT: Joi.number().default(5000),

  MONGO_URI: Joi.string().required(),
  REDIS_URL: Joi.string().required(),

  JWT_SECRET: Joi.string().min(10).required(),

  ACCESS_TOKEN_SECRET: Joi.string().required(),
  REFRESH_TOKEN_SECRET: Joi.string().required(),
  HEALTH_TOKEN: Joi.string().required(),

  CLIENT_URL: Joi.string().required(),
}).unknown();

// Validate
const { value: envVars, error } = envSchema.validate(process.env);

if (error) {
  throw new Error(`ENV Validation Error: ${error.message}`);
}

// Export typed config
export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,

  mongoUri: envVars.MONGO_URI,
  redisUrl: envVars.REDIS_URL,

  jwtSecret: envVars.JWT_SECRET,

  clientUrl: envVars.CLIENT_URL,
};
