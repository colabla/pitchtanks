module.exports = (env) => {
  if (env === 'development') {
      const secrets = require('./secrets.js');
      return secrets;
  }
  return {
    aws_access_key_id: process.env.AWS_ACCESS_KEY,
    aws_secret_access_key: process.env.AWS_SECRET_KEY,
    s3_bucket: process.env.S3_BUCKET,
  };
};
