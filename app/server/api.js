'use strict';

const aws = require('../../config/aws.js');

module.exports = (db) => {
  return {
    user: (req, res) => {
      res.json(req.user);
    },

    aws: (req, res) => {
      res.json(aws(process.env.NODE_ENV));
    },

    saveCampaign: (req, res) => {
      console.log(JSON.stringify(req.body));
      let someCampaign;
      // db.Campaign.remove({});

      // TODO: Find by NAME and then compare user, error handling the result.
      db.Campaign.findOne({ user: req.body.user }, (err, campaign) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          return done(err);
        }
        // if the user is found, then log them in
        if (campaign) {
          console.log(`FOUND: ${JSON.stringify(campaign)}`);
          someCampaign = campaign;

          // Is this their "submission" save?
          const newlyComplete = campaign.isComplete === req.body.isComplete;

          // Find a better way to do this later.
          someCampaign.isComplete = req.body.isComplete;
          someCampaign.user = req.body.user;
          someCampaign.name = req.body.name;
          someCampaign.tagline = req.body.tagline;
          someCampaign.website = req.body.website;
          someCampaign.joinDate = newlyComplete ? req.body.joinDate : Date.now();
          someCampaign.city = req.body.city;
          someCampaign.market = req.body.market;
          someCampaign.battles = req.body.battles;
          someCampaign.battleCount = req.body.battleCount;
          someCampaign.pitchDescription = req.body.pitchDescription;
          someCampaign.videoUploadDate = req.body.videoUploadDate;
          someCampaign.upvotes = req.body.upvotes;
          someCampaign.upvoteCount = req.body.upvoteCount;
          someCampaign.videoUrl = req.body.videoUrl;
          someCampaign.isHtml5 = req.body.isHtml5;
          someCampaign.logo = req.body.logo;
          someCampaign.thumbnail = req.body.thumbnail;
        } else {
          console.log('Did NOT find campaign.');
          someCampaign = new db.Campaign(req.body);
        }

        // save our user to the database
        someCampaign.save((err) => {
          if (err) {
            throw err;
          }

          // if successful, return the new campaign
          console.log('Server Save Success');
          res.status(201).json(someCampaign);
        });
      });
    },

    getCampaignByName: (req, res) => {
      db.Campaign.findOne({ name: req.params.name }, (err, campaign) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          console.log(`ERROR: ${err}`);
          return done(err);
        }
        // if the campaign is found return it
        if (campaign) {
          console.log(`f: ${JSON.stringify(campaign)}`);
          res.status(201).json(campaign);
        } else {
          console.log('Did NOT find campaign.');
          res.status(404).json({ err: 'Not found' });
        }
      });
    },

    getUserCampaign: (req, res) => {
      let someCampaign;
      db.Campaign.findOne({ user: req.params.user }, (err, campaign) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          console.log(`ERROR: ${err}`);
          return done(err);
        }
        // if the user is found, then update it.
        if (campaign) {
          console.log(`FOUND2: ${JSON.stringify(campaign)}`);
          someCampaign = campaign;
          res.status(201).json(someCampaign);
        } else {
          // else create a new one
          console.log('Did NOT find campaign.');
          someCampaign = new db.Campaign({ user: req.params.user, isComplete: false });

          // save our user to the database
          someCampaign.save((err) => {
            if (err) {
              throw err;
            }

            // if successful, return the new campaign
            res.status(201).json(someCampaign);
          });
        }
      });
    },

    getCampaigns: (req, res) => {
      db.Campaign.find({ isComplete: true }, (err, campaigns) => {
        if (err) { return res.status(400).send('err', err.message); }

        return res.status(200).send(campaigns);
      });
    },

    upvote: (req, res) => {
      db.Campaign.findOne({ _id: req.params.campaign }, (err, campaign) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        campaign.upvotes.push(req.params.user);
        campaign.save((err) => {
          if (err) {
            throw err;
          }
          db.User.findOne({ _id: req.params.user }, (err, user) => {
            user.upvotes.push(req.params.campaign);
            console.log(user.upvotes);
            user.save((err) => {
              if (err) {
                throw err;
              }
              res.status(200).send({ user, campaign });
            });
          });
        });
      });
    },
  };
};
