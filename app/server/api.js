const aws = require('../../config/aws.js');
exports.user = (req, res) => {
  res.json(req.user);
};

exports.aws = (req, res) => {
  res.json(aws(process.env.NODE_ENV));
};

exports.saveCampaign = (db) => {
  return (req, res) => {
    console.log('HEREEE');
    console.log(req);
    const newCampaign = new db.Campaign();
    res.send('here');
    // newCampaign.save((err, campaign) => {
    //   if (err) {
    //     return next(err);
    //   }
    //   return res.json(201, campaign);
    // });
  };
};
