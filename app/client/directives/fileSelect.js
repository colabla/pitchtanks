'use strict';

var fileSelect = function (app) {
  app.directive('fileSelect', ['$window', function ($window) {
    
    return {
      restrict: 'A',
      require: 'ngModel',
      link: function (scope, el, attr, ctrl) {
        
        scope.fileName = '';
        var fileReader = new $window.FileReader();

        fileReader.onload = function () {
          console.log(scope.fileName);
          ctrl.$setViewValue({
            data: fileReader.result,
            file: scope.fileName
          });

          if ('fileLoaded' in attr) {
            scope.$eval(attr.fileLoaded);
          }
        };

        fileReader.onprogress = function (event) {
          if ('fileProgress' in attr) {
            scope.$eval(attr.fileProgress, { $total: event.total, $loaded: event.loaded });
          }
        };

        fileReader.onerror = function () {
          if ('fileError' in attr) {
            scope.$eval(attr.fileError, { $error: fileReader.error });
          }
        };

        var fileType = attr.fileSelect;

        el.bind('change', function (e) {
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