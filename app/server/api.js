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

    saveUser: (req, res) => {
      db.User.findOne({ _id: req.body._id }, (err, user) => {
        // if there is an error, stop everything and return that
        // ie an error connecting to the database
        if (err) {
          return done(err);
        }
        // if the user is found, then log them in
        if (user) {
          user.profileImage = req.body.profileImage;
          user.firstName = req.body.firstName;
          user.lastName = req.body.lastName;
          user.email = req.body.email;
        } else {
          console.log('Did NOT find user.');
        }

        // save our user to the database
        user.save((err) => {
          if (err) {
            throw err;
          }

          // if successful, return the new campaign
          console.log('Server Save Success');
          res.status(201).json(user);
        });
      });
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
          someCampaign.battleCount = req.body.battles.length;
          someCampaign.pitchDescription = req.body.pitchDescription;
          someCampaign.videoUploadDate = req.body.videoUploadDate;
          someCampaign.upvotes = req.body.upvotes;
          someCampaign.battleVotes = req.body.battleVotes;
          someCampaign.upvoteCount = req.body.upvotes.length;
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

    getTopCampaigns: (req, res) => {
      db.Campaign.find({ isComplete: true })
        .sort({ upvoteCount: -1 })
        .limit(9).exec((err, campaigns) => {
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
        campaign.upvoteCount = campaign.upvotes.length;
        campaign.save((err) => {
          if (err) {
            throw err;
          }
          db.User.findOne({ _id: req.params.user }, (err, user) => {
            user.upvotes.push(req.params.campaign);
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

    voteForBattle: (req, res) => {
      db.Battle.findOne({ _id: req.params.battle }, (err, battle) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        if (battle.video1.id === req.params.video) {
          battle.video1.votes += 1;
        } else if (battle.video2.id === req.params.video) {
          battle.video2.votes += 1;
        } else {
          console.log('VIDEO NOT FOUND');
          console.log(battle);
        }

        battle.save((err) => {
          if (err) {
            console.log(`Battle save error: ${err}`);
          }

          db.User.findOne({ _id: req.params.user }, (err, user) => {
            if (err) {
              console.log(err);
              return done(err);
            }

            user.battleVotes.push(req.params.battle);
            user.save((err) => {
              if (err) {
                console.log(`User save error: ${err}`);
              }
              res.status(200).send({
                battle,
                user,
              });
            });
          });
        });
      });
    },

    getActiveBattle: (req, res) => {
      db.Battle.findOne({ isActive: true }, (err, battle) => {
        if (err) {
          console.log(err);
          return done(err);
        }

        // If there is an active battle, return it.
        if (battle) {
          console.log(battle);
          db.Campaign.findOne({ _id: battle.video1.id }, (err, campaign1) => {
            if (err) {
              console.log(`campaign1 error: ${err}`);
              throw err;
            }
            db.Campaign.findOne({ _id: battle.video2.id }, (err, campaign2) => {
              if (err) {
                console.log(`campaign2 error: ${err}`);
                throw err;
              }
              res.status(200).send({
                campaign1,
                campaign2,
                battle,
              });
            });
          });
        } else { // Otherwise, create a new battle.
          db.Campaign.find({ isComplete: true }).count((e, count) => {
            if (count > 1) {
              db.Campaign.find().sort({ battleCount: 1 }).exec((err, campaigns) => {
                // Choose the campaign with the fewest number of battles.
                const campaign1 = campaigns[0];
                let campaign2;
                // Look through the rest of the campaigns to find its opponent.
                for (let i = 1; i < campaigns.length; i++) {
                  let foundIt = true;
                  // Look through each campaign's battles
                  for (let j = 0; j < campaigns[i].battles.length; j++) {
                    // If there is already a battle between these two, we don't want to do it again.
                    if (campaigns[i].battles[j].video1.id === campaign1._id) {
                      foundIt = false;
                      break;
                    } else if (campaigns[i].battles[j].video2.id === campaign1._id) {
                      foundIt = false;
                      break;
                    }
                  }
                  if (foundIt) {
                    campaign2 = campaigns[i];
                    break;
                  }
                }
                // If we found it, create a new battle,
                // add it to each of the campaigns, save all of it, and return.
                // If we did not find it, set second campaign to campaigns[1] and do the same.
                if (!campaign2) {
                  console.log('Every campaign has battled every other campaign.');
                  campaign2 = campaigns[1];
                }
                console.log(`${campaign1.name} vs ${campaign2.name}`);
                const battleData = {
                  video1: {
                    id: campaign1._id,
                    votes: 0,
                  },
                  video2: {
                    id: campaign2._id,
                    votes: 0,
                  },
                  isActive: true,
                  dateCreated: new Date(),
                };
                const newBattle = new db.Battle(battleData);
                console.log(newBattle);

                // Set campaigns
                campaign1.battles.push(newBattle);
                campaign1.battleCount = campaign1.battles.length;
                campaign2.battles.push(newBattle);
                campaign2.battleCount = campaign2.battles.length;

                console.log(`campaign1 battles: ${campaign1.battles}`);
                console.log(`campaign2 battles: ${campaign2.battles}`);

                // Save data
                campaign1.save((err) => {
                  if (err) {
                    console.log(`campaign1 error: ${err}`);
                    throw err;
                  }
                  campaign2.save((err) => {
                    if (err) {
                      console.log(`campaign2 error: ${err}`);
                      throw err;
                    }
                    newBattle.save((err) => {
                      if (err) {
                        console.log(`newBattle error: ${err}`);
                        throw err;
                      }
                      res.status(200).send({
                        campaign1,
                        campaign2,
                        battle: newBattle,
                      });
                    });
                  });
                });
              });
            } else {
              // return placeholder battle & campaigns.
              console.log('Not enough campaigns!');
              res.status(200).send({
                campaign1: {
                  name: 'Moeo, LLC',
                  tagline: 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula.',
                  videoUrl: '/public/videos/big_buck_bunny.mp4',
                  logo: '/public/images/company_logos/company-logo-1.png',
                },
                campaign2: {
                  name: 'Concur',
                  tagline: 'Sed posuere consectetur est at lobortis.',
                  videoUrl: '/public/videos/small.webm',
                  logo: '/public/images/company_logos/company-logo-2.png',
                },
                battle: {
                  video1: {
                    votes: 320,
                  },
                  video2: {
                    votes: 124,
                  },
                },
              });
            }
          });
        }
      });
    },
  };
};
