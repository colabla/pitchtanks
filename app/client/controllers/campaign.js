const campaignController = () => {
  return ['$scope', '$state', 'aws', '$http', 'LoadingService',
  function (                             // eslint-disable-line func-names
    $scope, $state, aws, $http, LoadingService
  ) {
    // Instantiate Campaign.
    $scope.campaign = JSON.parse(JSON.stringify($scope.PTApp.campaign()));
    $scope.video = {};
    $scope.logo = {};
    $scope.message = '';
    $scope.editing = $scope.campaign.isComplete && $scope.campaign.user === $scope.PTApp.user()._id;

    // Container for most recently uploaded file
    $scope.file = {};

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
    };

    $scope.getVUrl = () => {
      return $scope.video.data || $scope.campaign.videoUrl;
    };

    $scope.myLoaded = (prop) => {
      console.log($scope.file);
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
      $scope.upload($scope.logo.file, 'campaignLogos', 'logo', () => {
        $scope.upload($scope.video.file, 'campaignVideos', 'videoUrl', () => {
          $scope.campaign.videoUploadDate = Date.now();
          $scope.saveCampaign(doSubmit);
        });
      });
    };

    // Do form validation
    $scope.validateForm = () => {
      [
        'name',
        'pitchDescription',
        'tagline',
        'website',
        'videoUrl',
        'logo',
      ].forEach((prop) => {
        if (!($scope.campaign[prop] && $scope.campaign[prop].length)) {
          $scope.incompleteFields.push(prop);
        }
      });
      return !$scope.incompleteFields.length;
    };

    $scope.proceed = () => {
      // When profile is complete go to next state.
      // When this is abstracted, we can send user from create -> edit, edit -> view
      $state.go('app.campaign.edit');
    };

    $scope.saveCampaign = (doSubmit) => {
      // Reset errors
      $scope.incompleteFields = [];

      if (doSubmit) {
        $scope.campaign.isComplete = $scope.validateForm();
      }
      $http.post('/api/saveCampaign', $scope.campaign)
        .success((data) => {
          $scope.PTApp.$storage.campaign = JSON.parse(JSON.stringify(data));
          $scope.campaign = $scope.PTApp.$storage.campaign;
          $scope.message = `Save success!`;
          $('.message-section')
            .removeClass('hidden animated fadeOut')
            .addClass('animated fadeOut')
            .one('webkitAnimationEnd mozAnimationEnd MSAnimationEnd oanimationend animationend',
            function () { // eslint-disable-line
              $(this).removeClass('fadeOut animated');
              $(this).addClass('hidden');
            });
          if ($scope.campaign.isComplete) {
            $state.go('app.campaign.edit');
          }
        })
        .error((data, status, header, config) => {
          console.log('error');
          console.log(data);
        });
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
