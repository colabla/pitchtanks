'use strict';
const homeController = () => {
  return ['$scope', '$state', 'topCampaigns', 'battle', '$http',
    function (                             // eslint-disable-line func-names
      $scope, $state, topCampaigns, battle, $http
    ) {
      $scope.topCampaigns = topCampaigns;

      $scope.battleData = battle;

      $scope.hasUserVoted = () => {
        let hasVoted = false;
        if (!$scope.PTApp.user()) {
          return false;
        }
        $scope.PTApp.user().battleVotes.forEach((b) => {
          if (b === $scope.battleData.battle._id) {
            hasVoted = true;
          }
        });
        return hasVoted;
      };

      $scope.userHasVoted = $scope.hasUserVoted();

      $scope.voteForBattle = (vId) => {
        if ($scope.userHasVoted || !$scope.battleData.battle._id || !vId) {
          return;
        }
        $scope.userHasVoted = true;
        if ($scope.PTApp.user()) {
          $http.post(`/api/voteForBattle/${$scope.battleData.battle._id}/${vId}/${$scope.PTApp.user()._id}`) // eslint-disable-line
            .success((data) => {
              console.log(data);
              $scope.PTApp.$session.user = data.user;
              $scope.battleData.battle = data.battle;
            });
        } else {
          $state.go('app.login');
        }
      };

      $scope.howItWorks = {
        isActive: (i) => {
          return i === $scope.howItWorks.active;
        },
        active: 2,
        anglePos: () => { return `${100 * ($scope.howItWorks.active / 3)}%`; },
        angleColor: () => { return `color${$scope.howItWorks.active}`; },
        descBg: () => { return `bg${$scope.howItWorks.active}`; },
        setActive: (i) => { $scope.howItWorks.active = i; },
      };
      $scope.changeImg = (e, i) => {
        $scope.howItWorks.active = i;
      };

      // TODO: Use this to adjust heights of vs-panels.
      // $scope.$broadcast('dataloaded');
    },
  ];
};
