// Configure the backend to use S3 during testing.
// These are dummy values, not real AWS resources.

process.env.STORAGE_DRIVER = "s3";
process.env.S3_BUCKET = "dropbox-test-bucket";
process.env.AWS_REGION = "eu-west-1";