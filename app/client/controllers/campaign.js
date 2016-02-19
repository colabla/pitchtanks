const campaignController = () => {
  return ['$scope', '$state', 'aws', '$sce', '$http',
  function (                             // eslint-disable-line func-names
    $scope, $state, aws, $sce, $http
  ) {
    // Instantiate Campaign.
    $scope.campaign = {
      isComplete: false,
      user: undefined,
      name: '',
      tagline: '',
      website: '',
      joinDate: undefined,
      city: '',
      market: '',
      battles: [],
      battleCount: 0,
      pitchDescription: '',
      videoUploadDate: undefined,
      upvotes: [],
      upvoteCount: 0,
      videoUrl: undefined,
      logo: undefined,
    };
    $scope.video = {};
    $scope.logo = {};

    // Container for most recently uploaded file
    $scope.file = {};

    $scope.trustSrc = (src) => {
      return $sce.trustAsResourceUrl(src);
    };

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

    $scope.getVUrl = () => {
      return $scope.video.data || '';
    };

    $scope.myLoaded = (prop) => {
      console.log('loaded');
      console.log($scope.file);
      $scope.setFile($scope.trustSrc($scope.file.data), $scope.file.file, prop);
      $scope.$apply();
    };

    $scope.setFile = (data, file, prop) => {
      $scope[prop].data = data;
      $scope[prop].file = file;
      console.log(`Set ${prop}: ${$scope.video.data !== undefined}`);
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
    $scope.save = () => {
      $scope.campaign.user = $scope.user()._id;
      $scope.campaign.pitchDescription = $scope.escapeHTML($scope.campaign.pitchDescription);
      $scope.upload($scope.logo.file, 'campaignLogos', 'logo', () => {
        console.log('callback');
        $scope.upload($scope.video.file, 'campaignVideos', 'videoUrl', () => {
          $scope.campaign.videoUploadDate = Date.now();
          $scope.saveCampaign();
        });
      });
    };

    // Michele Bosi, http://stackoverflow.com/questions/5251520
    $scope.escapeHTML = (s) => {
      return s.replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');
    };

    // Do form validation
    $scope.validateForm = () => {
      return {
        isValid: false,
      };
    };

    // Submit can only be done if all required fields are completed.
    $scope.submit = () => {
      const formValidity = $scope.validateForm();
      if (formValidity.isValid) {
        $scope.campaign.isComplete = formValidity.isValid;
        $scope.save();
      } else {
        console.log(formValidity);
      }
    };

    $scope.proceed = () => {
      // When profile is complete go to next state.
      // When this is abstracted, we can send user from create -> edit, edit -> view
      $state.go('app.campaign.edit');
    };

    $scope.saveCampaign = () => {
      console.log(`Saving: ${JSON.stringify($scope.campaign)}`);

      $http.post('/api/saveCampaign', { data: $scope.campaign })
        .success((data, status, header, config) => {
          console.log('success');
          console.log(data, status, header, config);

          if ($scope.campaign.isComplete) {
            $state.go('app.campaign.edit');
          }
        })
        .error((data, status, header, config) => {
          console.log('error');
          console.log(data, status, header, config);
        });
    };

    $scope.upload = (file, folder, prop, callback) => {
      console.log(file);
      // Put this AWS upload code into a service if we need to use it elsewhere.
      console.log('saving...');
      AWS.config.update({
        accessKeyId: aws.data.aws_access_key_id,
        secretAccessKey: aws.data.aws_secret_access_key,
      });
      AWS.config.region = 'us-west-2';
      const bucket = new AWS.S3({
        params: { Bucket: `${aws.data.s3_bucket}/${folder}/${$scope.user()._id}` },
      });
      if (file) {
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
          $scope.campaign[prop] = `https://s3-us-west-2.amazonaws.com/${folder}/${aws.data.s3_bucket}/${$scope.user()._id}/${file.name}`;
          console.log($scope.campaign[prop]);
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
