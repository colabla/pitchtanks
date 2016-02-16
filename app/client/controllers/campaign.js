const campaignController = () => {
  return ['$scope', '$state', 'Upload', '$timeout', 'aws',
  function (                             // eslint-disable-line func-names
    $scope, $state, Upload, $timeout, aws
  ) {
    $scope.campaign = {};

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

    $scope.uploadFiles = (file, errFiles) => {
      console.log('here');
      $scope.f = file;
      $scope.errFile = errFiles && errFiles[0];
      if (file) {
        console.log(file);
        file.upload = Upload.upload({
          url: '/api/uploadPhoto',
          data: { file },
        });

        file.upload.then((response) => {
          console.log(`RES: ${response}`);
          $timeout(() => {
            console.log(`RES: ${response}`);
            file.result = response.data;
          });
        }, (response) => {
          console.log(`RES: ${response}`);
          if (response.status > 0) {
            $scope.errorMsg = `${response.status}: ${response.data}`;
            console.log(`ERROR: ${$scope.errorMsg}`);
          }
        }, (evt) => {
          file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
          console.log(`PROGRESS: ${file.progress}`);
        });
      }
    };

    $scope.save = () => {
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
        params: { Bucket: `${aws.data.s3_bucket}/campaignLogos` },
      });
      if ($scope.f) {
        const params = {
          ACL: 'public-read',
          Key: $scope.f.name,
          ContentType: $scope.f.type,
          Body: $scope.f,
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
          $scope.campaign.logo = `https://s3-us-west-2.amazonaws.com/campaignLogos/${aws.data.s3_bucket}/${$scope.f.name}`;
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
