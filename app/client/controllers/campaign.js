const campaignController = () => {
  return ['$scope', '$state', 'Upload', '$timeout',
  function (                             // eslint-disable-line func-names
    $scope, $state, Upload, $timeout
  ) {
    $scope.timer = undefined;
    
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
  },
];
};
