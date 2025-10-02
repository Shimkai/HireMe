import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

const envSchema = Joi.object({
  NODE_ENV: Joi.string().valid('development', 'production', 'test').default('development'),
  PORT: Joi.number().default(5000),
  MONGODB_URI: Joi.string().required(),
  JWT_SECRET: Joi.string().required().min(32),
  JWT_EXPIRE: Joi.string().default('7d'),
  CLIENT_URL: Joi.string().required(),
  MAX_FILE_SIZE: Joi.number().default(5242880),
  UPLOAD_PATH: Joi.string().default('./src/uploads'),
}).unknown();

const { error, value: envVars } = envSchema.validate(process.env);

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

export const config = {
  env: envVars.NODE_ENV,
  port: envVars.PORT,
  mongodb: {
    uri: envVars.MONGODB_URI,
  },
  jwt: {
    secret: envVars.JWT_SECRET,
    expire: envVars.JWT_EXPIRE,
  },
  client: {
    url: envVars.CLIENT_URL,
  },
  upload: {
    maxSize: envVars.MAX_FILE_SIZE,
    path: envVars.UPLOAD_PATH,
  },
};

