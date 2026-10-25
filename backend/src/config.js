// All of the environment variables used by the app.

const config = {
  NODE_ENV: process.env.NODE_ENV || "development",
  PORT: Number(process.env.PORT) || 3000,

  DB_HOST: process.env.DB_HOST,
  DB_PORT: Number(process.env.DB_PORT) || 3306,
  DB_USER: process.env.DB_USER,
  DB_PASSWORD: process.env.DB_PASSWORD,
  DB_NAME: process.env.DB_NAME,

  // Signs login tokens and local storage links. Must be long and random in production.
  APP_SECRET: process.env.APP_SECRET,

  // The API's own public URL. Used to build links to files with the local driver.
  API_URL: process.env.API_URL || "http://localhost:3000",

  // The frontend's URL. Only this origin may call the API from a browser.
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",

  MAX_UPLOAD_MB: Number(process.env.MAX_UPLOAD_MB) || 50,

  // "local" or "s3"
  STORAGE_DRIVER: process.env.STORAGE_DRIVER || "local",
  UPLOAD_DIR: process.env.UPLOAD_DIR || "./uploads",
  S3_BUCKET: process.env.S3_BUCKET,
  AWS_REGION: process.env.AWS_REGION,
};

export default config;
