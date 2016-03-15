'use strict';
var PitchTanks = angular.module('pitchTanks', ['ui.router', 'ngStorage', 'angular-medium-editor', 'ngSanitize', 'angularUtils.directives.dirPagination']);

PitchTanks.run(['$rootScope', '$state', '$stateParams', function ($rootScope, $state, $stateParams) {
  $rootScope.$state = $state;
  $rootScope.$stateParams = $stateParams;
}]).config(['$stateProvider', '$urlRouterProvider', function ($stateProvider, $urlRouterProvider) {
  var DIR = './client/views';
  $urlRouterProvider.otherwise('/');
  $stateProvider.state('app', {
    abstract: true,
    url: '/',
    templateUrl: DIR + '/layout.html',
    resolve: {
      topCampaigns: ['TopCampaigns', '$localStorage', function (TopCampaigns, $localStorage) {
        console.log('HERE');
        if ($localStorage.topCampaigns && (Date.now() - $localStorage.topCampaigns.timestamp) < 3600000) {
          return $localStorage.topCampaigns.data;
        }

        return TopCampaigns.getTopCampaigns().then(function (data) {
          $localStorage.topCampaigns = {
            data: data.data,
            timestamp: Date.now()
          };
          console.log("Fetched top campaigns");
          return data.data;
        });
      }]
    },
    controller: appController(DIR)
  })

  .state('app.home', {
    url: '',
    templateUrl: DIR + '/home.html',
    onEnter: function() {
      console.log('ENTER HOME');
    },
    resolve: {
      battle: ['$http', function ($http) {
        return $http({
          method: 'GET',
          url: '/api/getActiveBattle'
        }).then(function (data) {
          console.log(data);
          return data.data;
        });
      }]
    },
    controller: homeController()
  })

  .state('app.loggedIn', {
    url: 'login/accept',
    templateUrl: DIR + '/login.html',
    controller: ['$http', '$state', '$scope', 'LoadingService', function (  
    $http, $state, $scope, LoadingService) {
      // Get user & save to localStorage
      $http.get('/api/user/').success(function (data) {
        $scope.PTApp.$session.user = data;

        // Get campaign and save to localStorage
        $http.get('/api/getUserCampaign/' + data._id).success(function (campaign) {
          console.log('User campaign: ' + campaign);
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
    templateUrl: DIR + '/settings.html',
    resolve: {
      aws: ['$http', function ($http) {
        return $http({
          method: 'GET',
          url: '/api/aws'
        }).then(function (data) {
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
    template: '<div ui-view></div>',
    resolve: {
      showMessage: ['$stateParams', function ($stateParams) {
        return $stateParams.showMessage;
      }]
    }
  })

  .state('app.campaign.create', {
    url: 'create',
    templateUrl: DIR + '/campaign/create.html',
    controller: campaignController(),
    resolve: {
      aws: ['$http', function ($http) {
        return $http({
          method: 'GET',
          url: '/api/aws'
        }).then(function (data) {
          return data;
        });
      }]
    },
    onEnter: ['$state', '$localStorage', '$sessionStorage', function ($state, $localStorage, $sessionStorage) {
      
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
  })

  .state('app.campaign.edit', {
    url: 'edit',
    params: {
      campaign: undefined
    },
    templateUrl: DIR + '/campaign/create.html',
    resolve: {
      aws: ['$http', function ($http) {
        return $http({
          method: 'GET',
          url: '/api/aws'
        }).then(function (data) {
          return data;
        });
      }]
    },
    controller: campaignController(),
    onEnter: ['$state', '$localStorage', '$sessionStorage', '$stateParams', function ($state, $localStorage, $sessionStorage, $stateParams) {
      
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
  })

  .state('app.campaign.view', {
    url: 'view/:name',
    params: {
      campaign: undefined
    },
    templateUrl: DIR + '/campaign/create.html',
    resolve: {
      foundCampaign: ['$http', '$stateParams', function ($http, $stateParams) {
        if (!$stateParams.campaign) {
          return $http({
            method: 'GET',
            url: '/api/getCampaignByName/' + $stateParams.name
          }).then(function (data) {
            return data.data;
          });
        }
        return $stateParams.campaign;
      }]
    },
    controller: ['$http', '$state', '$scope', 'foundCampaign', '$stateParams', 'topCampaigns', 'TopCampaigns', 'UpvoteService',
    function ($http, $state, $scope, foundCampaign, $stateParams, topCampaigns, TopCampaigns, UpvoteService) {

      // Entry logic
      // Redirect if the user doesn't belong here.
      if ($scope.PTApp.user()) {
        if (!foundCampaign.isComplete && // Require complete
        foundCampaign.user !== $scope.PTApp.user()._id) {
          // allow owner
          $state.go('app.pitches');
        } else if (!foundCampaign.isComplete && foundCampaign.user === $scope.PTApp.user()._id) {
          
          $state.go('app.campaign.create');
        }
      }

      // Set the important variables.
      $scope.campaign = foundCampaign;
      $scope.topCampaigns = TopCampaigns.optionallyAppendCampaign($scope.campaign, topCampaigns);

      // View controller flag
      $scope.viewing = true;

      // Check if user is viewing his own campaign
      $scope.ownCampaign = $scope.PTApp.user() && $scope.PTApp.campaign().user === $scope.campaign.user;

      // This is a quick fix replacement for the getVUrl in campaign.js
      // TODO: Abstract or replace this.
      $scope.getVUrl = function () {
        return $scope.campaign.videoUrl;
      };

      // Watch for changes to topCampaigns
      // TODO: Add this to a service.
      $scope.indexInTop = -1;
      $scope.$watch('indexInTop', function (newVal, oldVal) {
        if (newVal !== oldVal && $scope.indexInTop >= 0) {
          $scope.topCampaigns = TopCampaigns.setTopCampaign($scope.campaign, $scope.indexInTop);
          console.log($scope.topCampaigns);
          $scope.indexInTop = -1;
        }
      });

      // Expose the service method to scope.
      $scope.userCanUpvote = UpvoteService.userCanUpvote($scope.PTApp.user(), $scope.campaign._id);

      // This is what we want to do after the user votes.
      $scope.voteContinuation = function(data) {
        // TODO: improve this variable shuffling.
        $scope.PTApp.$session.user = data.user;
        $scope.PTApp.$storage.campaign = data.campaign;
        $scope.campaign = $scope.PTApp.campaign();
        $scope.user = $scope.PTApp.user();

        // Sync the upvote with the a matching top campaign (instead of refreshing data from server)
        for (var i = 0; i < $scope.topCampaigns.length; i++) {
          if ($scope.topCampaigns[i].user === $scope.campaign.user) {
            $scope.indexInTop = i;
          }
        }
      };

      // Verify we have a user & return ID
      $scope.userId = $scope.PTApp.user()? $scope.PTApp.user()._id : false;

      $scope.voteUp = UpvoteService.voteUp($scope.userId, $scope.campaign._id, $scope.voteContinuation);
    }]
  })

  /* *********************
  ***** END CAMPAIGN *****
  ********************* */

  .state('app.about', {
    url: 'about',
    templateUrl: DIR + '/about.html'
  })

  .state('app.login', {
    url: 'login',
    templateUrl: DIR + '/login.html',
    controller: ['LoadingService', '$scope', function (LoadingService, $scope) {
      
      $scope.load = function () {
        LoadingService.setLoading(true);
      };
    }]
  })

  .state('app.pitches', {
    url: 'pitches',
    resolve: {
      campaigns: ['$http', function ($http) {
        return $http({
          method: 'GET',
          url: '/api/getCampaigns'
        }).then(function (data) {
          return data.data;
        });
      }]
    },
    templateUrl: DIR + '/pitches.html',
    controller: ['$state', '$scope', 'campaigns', function ($state, $scope, campaigns) {
      
      $scope.campaigns = campaigns;
      $scope.log = function () {
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

PTDirectives.forEach(function (directive) {
  directive(PitchTanks);
});
