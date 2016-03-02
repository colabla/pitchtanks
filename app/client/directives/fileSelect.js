const fileSelect = app => {
  app.directive('fileSelect', ['$window', function ($window) {
    // eslint-disable-line
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, el, attr, ctrl) {
        // eslint-disable-line
        scope.fileName = '';
        const fileReader = new $window.FileReader();

        fileReader.onload = () => {
          console.log(scope.fileName);
          ctrl.$setViewValue({
            data: fileReader.result,
            file: scope.fileName
          });

          if ('fileLoaded' in attr) {
            scope.$eval(attr.fileLoaded);
          }
        };

        fileReader.onprogress = event => {
          if ('fileProgress' in attr) {
            scope.$eval(attr.fileProgress, { $total: event.total, $loaded: event.loaded });
          }
        };

        fileReader.onerror = () => {
          if ('fileError' in attr) {
            scope.$eval(attr.fileError, { $error: fileReader.error });
          }
        };

        const fileType = attr.fileSelect;

        el.bind('change', e => {
          scope.fileName = e.target.files[0];
          console.log(scope.fileName);

          if (fileType === '' || fileType === 'text') {
            fileReader.readAsText(scope.fileName);
          } else if (fileType === 'data') {
            fileReader.readAsDataURL(scope.fileName);
          }
        });
      }
    };
  }]);
};