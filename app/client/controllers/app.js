'use strict';

var appController = function (DIR) {
  return ['$scope', '$state', '$http', 'LoadingService', '$localStorage', '$sessionStorage', function (
  $scope, $state, $http, LoadingService, $localStorage, $sessionStorage) {
    // Vars to be accessed throughout the app.
    $scope.PTApp = {
      storedVals: ['topCampaigns', 'topCampaignsTimestamp', 'campaign'],
      $storage: $localStorage,
      $session: $sessionStorage,
      user: function user() {
        return $scope.PTApp.$session.user;
      },
      campaign: function () {
        return $scope.PTApp.$storage.campaign;
      },

      // TODO: Make this a filter
      getPrettyDate: function (date) {
        var d = new Date(date);
        return [d.getMonth() + 1, d.getDate(), d.getFullYear() % 100].join('/');
      },
      marketOptions: ['SaaS', 'Other']
    };
    $scope.templates = {
      header: DIR + '/shared/header.html',
      footer: DIR + '/shared/footer.html'
    };

    $scope.loading = LoadingService.isLoading;

    $scope.logout = function () {
      $scope.PTApp.storedVals.forEach(function (val) {
        delete $scope.PTApp.$storage[val];
      });
      delete $scope.PTApp.$session.user;
      $state.go('app.home');
    };

    $scope.header = {
      hasCampaign: function () {
        return !!($scope.PTApp.$session.user && $scope.PTApp.$session.user.campaign);
      }
    };
  }];
};