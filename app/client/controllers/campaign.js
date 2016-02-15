const campaignController = () => {
  return ['$scope', '$state', 'Upload', '$timeout',
    function (                             // eslint-disable-line func-names
      $scope, $state, Upload, $timeout
    ) {
      $scope.timer = undefined;
      $scope.triggerUploadOn = (e, id) => {
        e.stopPropagation();
        $scope.timer = $timeout(() => {
          console.log('click');
          $(`#${id}`).trigger('click');
        }, 100);
      };

      $scope.$on('$destroy', () => { if ($scope.timer) { $timeout.cancel($scope.timer); } });

      $scope.uploadFiles = (file, errFiles) => {
        console.log('here');
        $scope.f = file;
        $scope.errFile = errFiles && errFiles[0];
        if (file) {
            file.upload = Upload.upload({
                url: '/api/uploadPhoto',
                data: { file },
            });

            file.upload.then((response) => {
                $timeout(() => {
                    file.result = response.data;
                });
            }, (response) => {
              if (response.status > 0) {
                $scope.errorMsg = `${response.status}: ${response.data}`;
              }
            }, (evt) => {
                file.progress = Math.min(100, parseInt(100.0 * evt.loaded / evt.total, 10));
            });
        }
      };
    },
  ];
};
