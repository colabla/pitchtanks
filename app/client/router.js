'use strict';

const PitchTanks = angular.module('pitchTanks', ['ui.router', 'ngStorage', 'angular-medium-editor', 'ngSanitize', 'angularUtils.directives.dirPagination']);

PitchTanks.run(['$rootScope', '$state', '$stateParams', ($rootScope, $state, $stateParams) => {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]).config(['$stateProvider', '$urlRouterProvider', ($stateProvider, $urlRouterProvider) => {
  const DIR = './client/views';
  $urlRouterProvider.otherwise('/');

  $stateProvider.state('app', {
    abstract: true,
    url: '/',
    templateUrl: `${ DIR }/layout.html`,
    controller: appController(DIR)
  }).state('app.home', {
    url: '',
    templateUrl: `${ DIR }/home.html`,
    resolve: {
      topCampaigns: ['TopCampaigns', function (TopCampaigns) {
        // eslint-disable-line
        return TopCampaigns.getTopCampaigns().then(data => {
          return data.data;
        });
      }],
      battle: ['$http', $http => {
        return $http({
          method: 'GET',
          url: '/api/getActiveBattle'
        }).then(data => {
          console.log(data);
          return data.data;
        });
      }]
    },
    controller: homeController()
  }).state('app.loggedIn', {
    url: 'login/accept',
    templateUrl: `${ DIR }/login.html`,
    controller: ['$http', '$state', '$scope', 'LoadingService', function ( // eslint-disable-line func-names
    $http, $state, $scope, LoadingService) {
      // Get user & save to localStorage
      $http.get('/api/user/').success(data => {
        $scope.PTApp.$session.user = data;

        // Get campaign and save to localStorage
        $http.get(`/api/getUserCampaign/${ data._id }`).success(campaign => {
          console.log(`User campaign: ${ campaign }`);
          $scope.PTApp.$storage.campaign = campaign;

          // Redirect home
          LoadingService.setLoading(false);
          $state.go('app.home');
        });
      });
    }]
  })

  /* *****************
  ***** SETTINGS *****
  ***************** */

  .state('app.settings', {
    url: 'settings',
    templateUrl: `${ DIR }/settings.html`,
    resolve: {
      aws: ['$http', $http => {
        return $http({
          method: 'GET',
          url: '/api/aws'
        }).then(data => {
          return data;
        });
      }]
    },
    controller: settingsController()
  })

  /* *********************
  ***** END SETTINGS *****
  ********************* */

  /* *****************
  ***** CAMPAIGN *****
  ***************** */

  .state('app.campaign', {
    abstract: true,
    url: 'campaign/',
    params: {
      showMessage: false
    },
    template: `<div ui-view></div>`,
    resolve: {
      topCampaigns: ['TopCampaigns', TopCampaigns => {
        return TopCampaigns.getTopCampaigns().then(data => {
          console.log(data.data);
          return data.data;
        });
      }],
      showMessage: ['$stateParams', $stateParams => {
        return $stateParams.showMessage;
      }],
      aws: ['$http', $http => {
        return $http({
          method: 'GET',
          url: '/api/aws'
        }).then(data => {
          return data;
        });
      }]
    }
  }). // controller: campaignController(),
  state('app.campaign.create', {
    url: 'create',
    templateUrl: `${ DIR }/campaign/create.html`,
    controller: campaignController(),
    onEnter: ['$state', '$localStorage', '$sessionStorage', function ($state, $localStorage, $sessionStorage) {
      // eslint-disable-line
      if (!$sessionStorage.user) {
        $state.go('app.login');
      }

      if (!$localStorage.campaign) {
        console.log('NO CAMPAIGN');
      }

      if ($localStorage.campaign.isComplete) {
        $state.go('app.campaign.edit');
      }
    }]
  }).state('app.campaign.edit', {
    url: 'edit',
    params: {
      campaign: undefined
    },
    templateUrl: `${ DIR }/campaign/create.html`,
    controller: campaignController(),
    onEnter: ['$state', '$localStorage', '$sessionStorage', '$stateParams', function ($state, $localStorage, $sessionStorage, $stateParams) {
      // eslint-disable-line
      if (!$sessionStorage.user) {
        $state.go('app.login');
      }

      if (!$localStorage.campaign) {
        console.log('NO CAMPAIGN');
      }

      if (!$localStorage.campaign.isComplete) {
        // If campaign is not complete, redirect to campaign create.
        $state.go('app.campaign.create');
      }
    }]
  }).state('app.campaign.view', {
    url: 'view/:name',
    params: {
      campaign: undefined
    },
    templateUrl: `${ DIR }/campaign/create.html`,
    resolve: {
      foundCampaign: ['$http', '$stateParams', ($http, $stateParams) => {
        if (!$stateParams.campaign) {
          return $http({
            method: 'GET',
            url: `/api/getCampaignByName/${ $stateParams.name }`
          }).then(data => {
            return data.data;
          });
        }
        return $stateParams.campaign;
      }]
    },
    controller: ['$http', '$state', '$scope', 'foundCampaign', '$stateParams', 'topCampaigns', 'TopCampaigns', // eslint-disable-line
    function ($http, $state, $scope, foundCampaign, $stateParams, topCampaigns, TopCampaigns) {
      // eslint-disable-line
      if ($scope.PTApp.user()) {
        if (!foundCampaign.isComplete && // Require complete
        foundCampaign.user !== $scope.PTApp.user()._id) {
          // allow owner
          $state.go('app.pitches');
        } else if (!foundCampaign.isComplete && foundCampaign.user === $scope.PTApp.user()._id) {
          // eslint-disable-line
          $state.go('app.campaign.create');
        }
      }
      $scope.campaign = foundCampaign;
      $scope.topCampaigns = topCampaigns;

      // Check for small numbers of campaigns
      if ($scope.topCampaigns.length < 2) {
        let add = true;
        for (let i = 0; i < $scope.topCampaigns.length; i++) {
          if ($scope.topCampaigns[i].user === $scope.campaign.user) {
            add = false;
          }
        }
        if (add) {
          $scope.topCampaigns.push($scope.campaign);
        }
      }
      $scope.viewing = true;
      $scope.ownCampaign = $scope.PTApp.user() && $scope.PTApp.campaign().user === $scope.campaign.user; // eslint-disable-line
      $scope.getVUrl = () => {
        return $scope.campaign.videoUrl;
      };

      // TODO: Figure out a better way to manage the campaign controllers.

      // Upvote handling
      $scope.userCanUpvote = () => {
        return !$scope.PTApp.user() || !$scope.PTApp.user().upvotes.includes($scope.campaign._id); // eslint-disable-line
      };

      $scope.userHasUpvoted = !$scope.userCanUpvote();

      $scope.indexInTop = -1;

      $scope.$watch('indexInTop', (newVal, oldVal) => {
        if (newVal !== oldVal && $scope.indexInTop >= 0) {
          $scope.topCampaigns = TopCampaigns.setTopCampaign($scope.campaign, $scope.indexInTop);
          console.log($scope.topCampaigns);
          $scope.indexInTop = -1;
        }
      });

      $scope.voteUp = () => {
        if (!$scope.PTApp.user()) {
          $state.go('app.login');
        } else {
          $scope.userHasUpvoted = true;
          $http.post(`/api/upvote/${ $scope.campaign._id }/${ $scope.PTApp.user()._id }`).success(data => {
            console.log(data);
            $scope.userHasUpvoted = true;
            $scope.PTApp.$session.user = data.user;
            $scope.PTApp.$storage.campaign = data.campaign;
            $scope.campaign = $scope.PTApp.campaign();
            $scope.user = $scope.PTApp.user();
            for (let i = 0; i < $scope.topCampaigns.length; i++) {
              if ($scope.topCampaigns[i].user === $scope.campaign.user) {
                $scope.indexInTop = i;
              }
            }
          });
        }
      };
    }]
  })

  /* *********************
  ***** END CAMPAIGN *****
  ********************* */

  .state('app.about', {
    url: 'about',
    templateUrl: `${ DIR }/about.html`
  }).state('app.login', {
    url: 'login',
    templateUrl: `${ DIR }/login.html`,
    controller: ['LoadingService', '$scope', function (LoadingService, $scope) {
      // eslint-disable-line
      $scope.load = () => {
        LoadingService.setLoading(true);
      };
    }]
  }).state('app.pitches', {
    url: 'pitches',
    resolve: {
      campaigns: ['$http', $http => {
        return $http({
          method: 'GET',
          url: '/api/getCampaigns'
        }).then(data => {
          return data.data;
        });
      }]
    },
    templateUrl: `${ DIR }/pitches.html`,
    controller: ['$state', '$scope', 'campaigns', function ($state, $scope, campaigns) {
      // eslint-disable-line
      $scope.campaigns = campaigns;
      $scope.log = () => {
        console.log($scope.pitchSort.sortBy);
      };

      $scope.sortOptions = [{
        name: 'Popularity',
        value: '-upvoteCount'
      }, {
        name: 'Recent',
        value: '-joinDate'
      }];

      $scope.pitchSort = {
        sortBy: $scope.sortOptions[0].value
      };
    }]
  });
}]);

PTDirectives.forEach(directive => {
  directive(PitchTanks);
});
