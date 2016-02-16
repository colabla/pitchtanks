const aws = require('../../config/aws.js');
exports.user = (req, res) => {
  res.json(req.user);
};

exports.aws = (req, res) => {
  res.json(aws(process.env.NODE_ENV));
};
