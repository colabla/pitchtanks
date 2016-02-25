'use strict';
const campaignController = () => {
  return ['$scope', '$state', 'aws', '$http', 'LoadingService', 'showMessage', 'topCampaigns', 'TopCampaigns', // eslint-disable-line
  function (                             // eslint-disable-line func-names
    $scope, $state, aws, $http, LoadingService, showMessage, topCampaigns, TopCampaigns
  ) {
    // Instantiate Campaign.
    $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
    $scope.topCampaigns = topCampaigns;

    // Check for small numbers of campaigns
    if ($scope.topCampaigns.length < 2 && $scope.campaign.isComplete) {
      let add = true;
      for (let i = 0; i < $scope.topCampaigns.length; i++) {
        if ($scope.topCampaigns[i].user === $scope.campaign.user) {
          add = false;
        }
      }
      if (add) {
        $scope.topCampaigns.push($scope.campaign);
      }
    }

    console.log(topCampaigns);
    $scope.video = {};
    $scope.logo = {};
    $scope.thumbnail = {};

    // Upvote handling
    $scope.userCanUpvote = () => {
      return !$scope.PTApp.user().upvotes.includes($scope.campaign._id);
    };

    $scope.indexInTop = -1;

    $scope.$watch('indexInTop', (newVal, oldVal) => {
      if (newVal !== oldVal && $scope.indexInTop >= 0) {
        $scope.topCampaigns = TopCampaigns.setTopCampaign($scope.campaign, $scope.indexInTop);
        console.log($scope.topCampaigns);
        $scope.indexInTop = -1;
      }
    });

    $scope.userHasUpvoted = !$scope.userCanUpvote();

    $scope.voteUp = () => {
      $scope.userHasUpvoted = true;
      $http.post(`/api/upvote/${$scope.campaign._id}/${$scope.PTApp.user()._id}`)
        .success((data) => {
          $scope.PTApp.$session.user = data.user;
          $scope.PTApp.$storage.campaign = data.campaign;
          $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
          for (let i = 0; i < $scope.topCampaigns.length; i++) {
            if ($scope.topCampaigns[i].user === $scope.campaign.user) {
              $scope.indexInTop = i;
            }
          }
        });
    };

    // Are we editing?
    $scope.editing = $scope.campaign.isComplete && $scope.campaign.user === $scope.PTApp.user()._id;

    // Container for most recently uploaded file
    $scope.file = {};

    // Message handling
    // TODO: Make into a service!
    $scope.messages = {
      success: {
        message: 'Save success!',
        class: 'success',
      },
    };

    $scope.showMessage = (m) => {
      $scope.message = m.message;
      $('.message-section')
        .removeClass('hidden animated fadeOut')
        .addClass(`animated fadeOut ${m.class}`)
        .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
        function () { // eslint-disable-line
          $(this).removeClass('fadeOut animated');
          $(this).addClass('hidden');
        });
    };

    if (showMessage) {
      $scope.showMessage($scope.messages.success);
    }

    $scope.incompleteFields = [];

    $scope.editorOptions = {
      toolbar: {
        buttons: [
          'bold',
          'italic',
          'underline',
          'anchor',
          'h1',
          'h3',
          'justifyCenter',
          'justifyLeft',
          'unorderedlist',
        ],
      },
    };

    $scope.resetCampaign = () => {
      $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
      $state.go('app.campaign.view', { name: $scope.campaign.name, campaign: $scope.campaign });
    };

    $scope.getVUrl = () => {
      return $scope.video.data || $scope.campaign.videoUrl;
    };

    $scope.myLoaded = (prop) => {
      console.log($scope.file);
      console.log(prop);
      $scope.setFile($scope.file.data, $scope.file.file, prop);
    };

    $scope.setFile = (data, file, prop) => {
      $scope[prop].data = data;
      $scope[prop].file = file;
      $scope.$apply();
    };

    $scope.myError = (e) => {
      console.log(`error: ${e}`);
    };

    // TODO: Create loading bar.
    $scope.myProgress = (total, loaded) => {
      console.log(`total: ${total}`);
      console.log(`loaded: ${loaded}`);
    };

    // Uploads files to AWS and saves campaign data.
    $scope.save = (doSubmit) => {
      // Prevent unauthorized saving
      if ($scope.campaign.user !== $scope.PTApp.campaign().user) {
        return;
      }
      $scope.upload($scope.logo.file, 'campaignLogos', 'logo', () => {
        $scope.upload($scope.thumbnail.file, 'campaignThumbnails', 'thumbnail', () => {
          $scope.upload($scope.video.file, 'campaignVideos', 'videoUrl', () => {
            $scope.campaign.videoUploadDate = Date.now();
            $scope.saveCampaign(doSubmit);
          });
        });
      });
    };

    // Do form validation
    $scope.validateForm = () => {
      [
        'name',
        'tagline',
        'website',
        'videoUrl',
        'logo',
        'thumbnail',
        'market',
      ].forEach((prop) => {
        if (!($scope.campaign[prop] && $scope.campaign[prop].length)) {
          $scope.incompleteFields.push(prop);
        }
      });
      // Special case for html
      if ($scope.campaign.pitchDescription.replace(/<br>/, '').length <= 7) {
        console.log($scope.campaign.pitchDescription);
        $scope.incompleteFields.push('pitchDescription');
      }
      return !$scope.incompleteFields.length;
    };

    $scope.saveCampaign = (doSubmit) => {
      // Reset errors
      let formIsValid;
      $scope.incompleteFields = [];

      if (doSubmit || $scope.campaign.isComplete) {
        formIsValid = $scope.validateForm();
        $scope.campaign.isComplete = $scope.campaign.isComplete || formIsValid;
      }
      if (formIsValid) {
        if (!$scope.campaign.upvoteCount) {
          $scope.campaign.upvoteCount = $scope.campaign.upvotes.length;
        }
        if (!$scope.campaign.battleCount) {
          $scope.campaign.upvoteCount = $scope.campaign.battles.length;
        }
        $http.post('/api/saveCampaign', $scope.campaign)
          .success((data) => {
            $scope.PTApp.$storage.campaign = JSON.parse(JSON.stringify(data));
            $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.$storage.campaign));

            if (!$scope.incompleteFields.length) {
              $scope.showMessage($scope.messages.success);

              if ($scope.campaign.isComplete) {
                for (let i = 0; i < $scope.topCampaigns.length; i++) {
                  if ($scope.topCampaigns[i].user === $scope.campaign.user) {
                    $scope.indexInTop = i;
                  }
                }
              }
            }
            if ($scope.campaign.isComplete && doSubmit) {
              $state.go('app.campaign.edit', { showMessage: true });
            }
          })
          .error((data, status, header, config) => {
            console.log('error');
            console.log(data);
          });
      }
    };

    $scope.upload = (file, folder, prop, callback) => {
      console.log(file);
      // Put this AWS upload code into a service if we need to use it elsewhere
      console.log('saving...');
      AWS.config.update({
        accessKeyId: aws.data.aws_access_key_id,
        secretAccessKey: aws.data.aws_secret_access_key,
      });
      AWS.config.region = 'us-west-2';
      const bucket = new AWS.S3({
        params: { Bucket: `${aws.data.s3_bucket}/${folder}/${$scope.PTApp.user()._id}` },
      });
      if (file) {
        LoadingService.setLoading(true);
        const params = {
          ACL: 'public-read',
          Key: file.name,
          ContentType: file.type,
          Body: file,
          ServerSideEncryption: 'AES256',
        };

        bucket.putObject(params, (err, data) => {
          if (err) {
            console.log(err.message);
            return false;
          }
          // else { Success! }
          console.log(data);
          console.log('Upload Done');
          $scope.campaign[prop] = `https://s3-us-west-2.amazonaws.com/${aws.data.s3_bucket}/${folder}/${$scope.PTApp.user()._id}/${file.name}`;
          LoadingService.setLoading(false);
          callback();
        })
        .on('httpUploadProgress', (progress) => {
          // Log Progress Information
          // TODO: create a loading bar.
          console.log(`${Math.round(progress.loaded / progress.total * 100)}% done`);
        });
      } else {
        callback();
      }
    };
  }];
};
