const AWS = require("aws-sdk");

AWS.config.update({
  accessKeyId: process.env.AWSACCESSKEY,
  secretAccessKey: process.env.AWSSECRETKEY,
  region: process.env.AWSREGION,
});

const s3 = new AWS.S3();

module.exports = s3;
