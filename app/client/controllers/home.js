'use strict';

var homeController = function () {
  return ['$scope', '$state', 'topCampaigns', 'battle', '$http', function ( 
  $scope, $state, topCampaigns, battle, $http) {
    $scope.topCampaigns = topCampaigns;

    $scope.battleData = battle;

    $scope.hasUserVoted = function () {
      var hasVoted = false;
      if (!$scope.PTApp.user()) {
        return false;
      }
      $scope.PTApp.user().battleVotes.forEach(function (b) {
        if (b === $scope.battleData.battle._id) {
          hasVoted = true;
        }
      });
      return hasVoted;
    };

    $scope.userHasVoted = $scope.hasUserVoted();

    $scope.voteForBattle = function (vId) {
      if ($scope.userHasVoted || !$scope.battleData.battle._id || !vId) {
        return;
      }
      $scope.userHasVoted = true;
      if ($scope.PTApp.user()) {
        $http.post('/api/voteForBattle/' + $scope.battleData.battle._id + '/' + vId + '/' + $scope.PTApp.user()._id) 
        .success(function (data) {
          console.log(data);
          $scope.PTApp.$session.user = data.user;
          $scope.battleData.battle = data.battle;
        });
      } else {
        $state.go('app.login');
      }
    };

    $scope.howItWorks = {
      isActive: function (i) {
        return i === $scope.howItWorks.active;
      },
      active: 2,
      anglePos: function () {
        return 100 * ($scope.howItWorks.active / 3) + '%';
      },
      angleColor: function () {
        return 'color' + $scope.howItWorks.active;
      },
      descBg: function () {
        return 'bg' + $scope.howItWorks.active;
      },
      setActive: function (i) {
        $scope.howItWorks.active = i;
      }
    };
    $scope.changeImg = function (e, i) {
      $scope.howItWorks.active = i;
    };

    // TODO: Use this to adjust heights of vs-panels.
    // $scope.$broadcast('dataloaded');
  }];
};