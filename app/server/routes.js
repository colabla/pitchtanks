module.exports = (app, passport, db, directory) => {
  const api = (require('./api'))(db);
  // =====================================
  // FACEBOOK ROUTES =====================
  // =====================================
  // route for facebook authentication and login

  app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

  // handle the callback after facebook has authenticated the user
  app.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
      failureRedirect: '/#/login',
    }), (req, res) => {
      return res.redirect('/#/login/accept');
    }
  );

  app.get('/auth/twitter', passport.authenticate('twitter', { }));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/twitter/callback',
    passport.authenticate('twitter', {
      failureRedirect: '/#/login',
    }), (req, res) => {
      return res.redirect('/#/login/accept');
    }
  );

  app.get('/auth/linkedin', passport.authenticate('linkedin', { }));

  // handle the callback after twitter has authenticated the user
  app.get('/auth/linkedin/callback',
    passport.authenticate('linkedin', {
      failureRedirect: '/#/login',
    }), (req, res) => {
      return res.redirect('/#/login/accept');
    }
  );

  // =====================================
  // API ROUTES ==========================
  // =====================================

  app.get('/api/user', api.user);
  app.get('/api/aws', api.aws);
  app.get('/api/getUserCampaign/:user', api.getUserCampaign);
  app.get('/api/getCampaignByName/:name', api.getCampaignByName);
  app.get('/api/getCampaigns', api.getCampaigns);
  app.post('/api/saveCampaign', api.saveCampaign);
  app.post('/api/upvote/:campaign/:user', api.upvote);

  // =====================================
  // END - API ROUTES ====================
  // =====================================

  // =====================================
  // ADMIN ROUTES ========================
  // =====================================

  app.get('/admin/reset', (req, res) => {
    db.User.remove({}, (err, user) => {
      db.Campaign.remove({}, (err, campaign) => {
        return res.redirect('/');
      });
    });
  });

  app.get('/admin/users', (req, res) => {
    db.User.find({}, (err, users) => {
      if (err) { return res.status(400).send('err', err.message); }

      console.log('users', users);

      return res.status(200).send(users);
    });
  });

  app.get('/admin/campaigns', (req, res) => {
    db.Campaign.find({}, (err, campaigns) => {
      if (err) { return res.status(400).send('err', err.message); }

      console.log('campaigns', campaigns);

      return res.status(200).send(campaigns);
    });
  });

  // =====================================
  // END - ADMIN ROUTES ==================
  // =====================================

  // =====================================
  // NAVIGATION ROUTES ===================
  // =====================================
  app.get('/logout', (req, res) => {
    req.logout();
    res.redirect('/');
  });


  // homepage
  app.get('*', (req, res) => {
    // pack all data that needs to be in the view here
    const viewModel = {};
    if (req.user) {
      viewModel.user = req.user;
    }
    res.sendFile(`${directory}/client/views/index.html`, viewModel);
  });
  // =====================================
  // END NAVIGATION ROUTES ===============
  // =====================================
};

const isLoggedIn = (req, res, next) => {
	if (req.isAuthenticated()) {
		return next();
	}

	res.redirect('/login');
};
