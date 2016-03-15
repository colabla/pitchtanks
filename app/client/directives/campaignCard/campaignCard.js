'use strict';

var campaignCard = function (app) {
  app.directive('campaignCard', ['$sce', function ($sce) {
    return {
      restrict: 'E',
      scope: {
        name: '=',
        tagline: '=',
        upvoteCount: '=',
        joinDate: '=',
        logo: '=',
        thumbnail: '=',
        big: '='
      },
      link: function link($scope, element, attrs, controller, transcludeFn) {
        // eslint-disable-line
        $scope.$watchGroup(['name', 'tagline', 'upvoteCount', 'logo', 'thumbnail'], function (newValues, oldValues) {
          var props = ['name', 'tagline', 'upvoteCount'];
          for (var i; i < props.length; i++) {
            if (newValues[i] !== oldValues[i]) {
              $scope[props[i]] = newValues[i];
            }
          }
          if (newValues[3] !== oldValues[3]) {
            $scope.trustedLogo = $scope.trustSrc(newValues[3]);
          }
          if (newValues[4] !== oldValues[4]) {
            $scope.trustedThumbnail = $scope.trustSrc(newValues[4]);
          }
        });

        $scope.getPrettyDate = function (date) {
          var d = new Date(date);
          return [d.getMonth() + 1, d.getDate(), d.getFullYear() % 100].join('/');
        };

        $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.trustedLogo = $scope.trustSrc($scope.logo);
        $scope.trustedThumbnail = $scope.trustSrc($scope.thumbnail);
      },
      templateUrl: '/client/directives/campaignCard/campaignCard.html'
    };
  }]);
};