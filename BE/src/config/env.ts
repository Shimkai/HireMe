import dotenv from 'dotenv';
import Joi from 'joi';

dotenv.config();

console.log("Loaded ENV:", process.env.MONGODB_URI);




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
  console.error('❌ Environment variable validation failed!');
  console.error('❌ Missing or invalid environment variables:');
  error.details.forEach((detail) => {
    console.error(`   - ${detail.path.join('.')}: ${detail.message}`);
  });
  console.error('\n💡 Please check your .env file and ensure all required variables are set.');
  console.error('💡 Required variables: MONGODB_URI, JWT_SECRET, CLIENT_URL');
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

