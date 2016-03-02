'use strict';
const settingsController = () => {
  return ['$scope', '$state', 'aws', '$http', 'LoadingService', function($scope, $state, aws, $http, LoadingService) { // eslint-disable-line
    $scope.userSettings = JSON.parse(JSON.stringify($scope.PTApp.user()));
    console.log($scope.userSettings);
    $scope.username = `${$scope.userSettings.firstName} ${$scope.userSettings.lastName}`;
    $scope.names = '';
    $scope.incompleteFields = [];
    $scope.file = {};
    $scope.myLoaded = () => {
      console.log('loaded');
    };

    $scope.myError = (e) => {
      console.log(`error: ${e}`);
    };

    // TODO: Create loading bar.
    $scope.myProgress = (total, loaded) => {
      console.log(`total: ${total}`);
      console.log(`loaded: ${loaded}`);
    };

    $scope.validateForm = () => {
      $scope.incompleteFields = [];
      if (!($scope.file.file || $scope.userSettings.profileImage)) {
        $scope.incompleteFields.push('file');
      }
      if (!$scope.username.length) {
        $scope.incompleteFields.push('name');
      }
      if (!$scope.userSettings.email || !$scope.userSettings.email.length) {
        $scope.incompleteFields.push('email');
      }
      return !($scope.incompleteFields.length);
    };

    // Message handling
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

    $scope.incompleteFields = [];

    $scope.save = () => {
      $scope.upload($scope.file.file, 'userProfile', 'profileImage', $scope.saveUser);
    };

    // TODO: Put this into a service!
    $scope.upload = (file, folder, prop, callback) => {
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
          console.log('Upload Done');
          $scope.userSettings[prop] = `https://s3-us-west-2.amazonaws.com/${aws.data.s3_bucket}/${folder}/${$scope.PTApp.user()._id}/${file.name}`;
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

    $scope.getNames = () => {
      const n = $scope.username.split(' ');
      return {
        first: n.shift(),
        last: n.length ? n.join(' ') : '',
      };
    };

    $scope.saveUser = () => {
      $scope.names = $scope.getNames();
      if ($scope.validateForm()) {
        $scope.userSettings.firstName = $scope.names.first;
        $scope.userSettings.lastName = $scope.names.last;
        $http.post('/api/saveUser', $scope.userSettings)
          .success((data) => {
            $scope.PTApp.$session.user = JSON.parse(JSON.stringify(data));
            $scope.userSettings = JSON.parse(JSON.stringify(data));

            if (!$scope.incompleteFields.length) {
              $scope.showMessage($scope.messages.success);
            }
          })
          .error((data, status, header, config) => {
            console.log('error');
            console.log(data);
          });
      } else {
        console.log('FAIL');
        LoadingService.setLoading(false);
        return;
      }
    };
  }];
};
