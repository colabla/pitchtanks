const campaignController = () => {
  return ['$scope', '$state', 'aws', '$sce',
  function (                             // eslint-disable-line func-names
    $scope, $state, aws, $sce
  ) {
    $scope.campaign = {};
    $scope.video = {};
    $scope.logo = {};
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

    $scope.myLoaded = (set) => {
      console.log('loaded');
      console.log($scope.file);
      set($scope.trustSrc($scope.file.data), $scope.file.file);
      $scope.$apply();
    };

    $scope.setVid = (data, file) => {
      $scope.video.data = data;
      $scope.video.file = file;
      console.log(`Set Vid: ${$scope.video.data !== undefined}`);
    };

    $scope.setLogo = (data, file) => {
      $scope.logo.data = data;
      $scope.logo.file = file;
      console.log(`Set Logo: ${$scope.logo.data !== undefined}`);
    };

    $scope.myError = (e) => {
      console.log(`error: ${e}`);
    };

    $scope.myProgress = (total, loaded) => {
      console.log(`total: ${total}`);
      console.log(`loaded: ${loaded}`);
    };

    $scope.save = () => {
      $scope.upload($scope.logo.file, 'campaignLogos');
      $scope.upload($scope.video.file, 'campaignVideos');
    };

    $scope.upload = (file, folder) => {
      console.log(file);
      // Put this AWS upload code into a service if we need to use it elsewhere.
      console.log('saving...');
      console.log(aws.data.aws_access_key_id);
      console.log(aws.data.aws_secret_access_key);
      console.log(aws.data.s3_bucket);
      AWS.config.update({
        accessKeyId: aws.data.aws_access_key_id,
        secretAccessKey: aws.data.aws_secret_access_key,
      });
      AWS.config.region = 'us-west-2';
      const bucket = new AWS.S3({
        params: { Bucket: `${aws.data.s3_bucket}/${folder}` },
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
            // There Was An Error With Your S3 Config
            console.log(err.message);
            return false;
          }
          // else { Success! }
          console.log(data);
          console.log('Upload Done');
          $scope.campaign.logo = `https://s3-us-west-2.amazonaws.com/campaignLogos/${aws.data.s3_bucket}/${file.name}`;
          console.log($scope.campaignLogo.url);
        })
        .on('httpUploadProgress', (progress) => {
          // Log Progress Information
          console.log(`${Math.round(progress.loaded / progress.total * 100)}% done`);
        });
      }
    };
  },
];
};
