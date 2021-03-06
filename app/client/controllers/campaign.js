'use strict';

var campaignController = function () {
  return ['$scope', '$state', 'aws', '$http', 'LoadingService', 'showMessage', 'topCampaigns', 'TopCampaigns', 'UpvoteService',
  function ($scope, $state, aws, $http, LoadingService, showMessage, topCampaigns, TopCampaigns, UpvoteService) {
    // Instantiate Campaign.
    $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
    $scope.topCampaigns = TopCampaigns.optionallyAppendCampaign($scope.campaign, topCampaigns);

    // Containers for individual files
    $scope.video = {};
    $scope.logo = {};
    $scope.thumbnail = {};
    // Container for most recently uploaded file
    $scope.file = {};

    // Are we editing?
    $scope.editing = $scope.campaign.isComplete && $scope.campaign.user === $scope.PTApp.user()._id;

    $scope.incompleteFields = [];

    // Verify we have a user & return ID
    $scope.userId = $scope.PTApp.user()? $scope.PTApp.user()._id : false;

    $scope.indexInTop = -1;
    $scope.$watch('indexInTop', function (newVal, oldVal) {
      if (newVal !== oldVal && $scope.indexInTop >= 0) {
        $scope.topCampaigns = TopCampaigns.setTopCampaign($scope.campaign, $scope.indexInTop);
        console.log($scope.topCampaigns);
        $scope.indexInTop = -1;
      }
    });

    /////////////////////
    // Upvote handling //
    /////////////////////

    $scope.userCanUpvote = UpvoteService.userCanUpvote($scope.PTApp.user(), $scope.campaign._id);

    // This is what we want to do after the user votes.
    $scope.voteContinuation = function(data) {
      // TODO: improve this variable shuffling.
      $scope.PTApp.$session.user = data.user;
      $scope.PTApp.$storage.campaign = data.campaign;
      $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));

      for (var i = 0; i < $scope.topCampaigns.length; i++) {
        if ($scope.topCampaigns[i].user === $scope.campaign.user) {
          $scope.indexInTop = i;
        }
      }
    };

    $scope.voteUp = UpvoteService.voteUp($scope.userId, $scope.campaign._id, $scope.voteContinuation);


    // Message handling
    // TODO: Make into a service!
    $scope.messages = {
      success: {
        message: 'Save success!',
        class: 'success'
      }
    };

    $scope.showMessage = function (m) {
      $scope.message = m.message;
      $('.message-section').removeClass('hidden animated fadeOut').addClass('animated fadeOut ' + m.class).one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend', function () {
        
        $(this).removeClass('fadeOut animated');
        $(this).addClass('hidden');
      });
    };

    if (showMessage) {
      $scope.showMessage($scope.messages.success);
    }

    $scope.editorOptions = {
      toolbar: {
        buttons: ['bold', 'italic', 'underline', 'anchor', 'h1', 'h3', 'justifyCenter', 'justifyLeft', 'unorderedlist']
      }
    };

    $scope.resetCampaign = function () {
      $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
      $state.go('app.campaign.view', { name: $scope.campaign.name, campaign: $scope.campaign });
    };

    $scope.getVUrl = function () {
      return $scope.video.data || $scope.campaign.videoUrl;
    };

    $scope.setFile = function (data, file, prop) {
      $scope[prop].data = data;
      $scope[prop].file = file;
      $scope.$apply();
    };

    $scope.myLoaded = function (prop) {
      console.log($scope.file);
      console.log(prop);
      $scope.setFile($scope.file.data, $scope.file.file, prop);
    };

    $scope.myError = function (e) {
      console.log('error: ' + e);
    };

    // TODO: Create loading bar.
    $scope.myProgress = function (total, loaded) {
      console.log('total: ' + total);
      console.log('loaded: ' + loaded);
    };

    // Uploads files to AWS and saves campaign data.
    $scope.save = function (doSubmit) {
      // Prevent unauthorized saving
      if ($scope.campaign.user !== $scope.PTApp.campaign().user) {
        return;
      }
      $scope.upload($scope.logo.file, 'campaignLogos', 'logo', function () {
        $scope.upload($scope.thumbnail.file, 'campaignThumbnails', 'thumbnail', function () {
          $scope.upload($scope.video.file, 'campaignVideos', 'videoUrl', function () {
            $scope.campaign.videoUploadDate = Date.now(); // TODO: Fix this (we don't always want to update this value).
            $scope.saveCampaign(doSubmit);
          });
        });
      });
    };

    $scope.hasMadeChanges = function () {
      return JSON.stringify($scope.campaign) !== JSON.stringify($scope.PTApp.campaign());
    };

    // Do form validation
    $scope.validateForm = function () {
      ['name', 'tagline', 'website', 'videoUrl', 'logo', 'thumbnail', 'city', 'market'].forEach(function (prop) {
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

    $scope.saveCampaign = function (doSubmit) {
      // Reset errors
      var formIsValid = undefined;
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
          $scope.campaign.battleCount = $scope.campaign.battles.length;
        }
        $http.post('/api/saveCampaign', $scope.campaign).success(function (data) {
          $scope.PTApp.$storage.campaign = JSON.parse(JSON.stringify(data));
          $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.$storage.campaign));
          console.log(JSON.stringify($scope.campaign) !== JSON.stringify($scope.PTApp.campaign()));

          if (!$scope.incompleteFields.length) {
            $scope.showMessage($scope.messages.success);

            if ($scope.campaign.isComplete) {
              for (var i = 0; i < $scope.topCampaigns.length; i++) {
                if ($scope.topCampaigns[i].user === $scope.campaign.user) {
                  $scope.indexInTop = i;
                }
              }
            }
          }
          if ($scope.campaign.isComplete && doSubmit) {
            $state.go('app.campaign.edit', { showMessage: true });
          }
        }).error(function (data, status, header, config) {
          console.log('error');
          console.log(data);
        });
      }
    };

    $scope.upload = function (file, folder, prop, callback) {
      console.log(file);
      // Put this AWS upload code into a service if we need to use it elsewhere
      console.log('saving...');
      AWS.config.update({
        accessKeyId: aws.data.aws_access_key_id,
        secretAccessKey: aws.data.aws_secret_access_key
      });
      AWS.config.region = 'us-west-2';
      var bucket = new AWS.S3({
        params: { Bucket: aws.data.s3_bucket + '/' + folder + '/' + $scope.PTApp.user()._id }
      });
      if (file) {
        LoadingService.setLoading(true);
        var params = {
          ACL: 'public-read',
          Key: file.name,
          ContentType: file.type,
          Body: file,
          ServerSideEncryption: 'AES256'
        };

        bucket.putObject(params, function (err, data) {
          if (err) {
            console.log(err.message);
            return false;
          }
          // else { Success! }
          console.log(data);
          console.log('Upload Done');
          $scope.campaign[prop] = 'https://s3-us-west-2.amazonaws.com/' + aws.data.s3_bucket + '/' + folder + '/' + $scope.PTApp.user()._id + '/' + file.name;
          LoadingService.setLoading(false);
          callback();
        }).on('httpUploadProgress', function (progress) {
          // Log Progress Information
          // TODO: create a loading bar.
          console.log(Math.round(progress.loaded / progress.total * 100) + '% done');
        });
      } else {
        callback();
      }
    };
  }];
};
