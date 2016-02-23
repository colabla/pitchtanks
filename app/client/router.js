const PitchTanks = angular.module('pitchTanks', [
  'ui.router',
  'ngStorage',
  'angular-medium-editor',
  'ngSanitize',
]);

PitchTanks.run(
  ['$rootScope', '$state', '$stateParams',
    ($rootScope, $state, $stateParams) => {
      $rootScope.$state = $state;
      $rootScope.$stateParams = $stateParams;
    },
  ]
)

.config(['$stateProvider', '$urlRouterProvider',
  ($stateProvider, $urlRouterProvider) => {
    const DIR = './client/views';
    $urlRouterProvider.otherwise('/');

    $stateProvider

    .state('app', {
      abstract: true,
      url: '/',
      templateUrl: `${DIR}/layout.html`,
      controller: appController(DIR),
    })

    .state('app.home', {
      url: '',
      templateUrl: `${DIR}/home.html`,
      controller: homeController(),
    })

    .state('app.loggedIn', {
      url: 'login/accept',
      templateUrl: `${DIR}/login.html`,
      controller: [
        '$http', '$state', '$scope', 'LoadingService',
        function (                           // eslint-disable-line func-names
          $http, $state, $scope, LoadingService
        ) {
          LoadingService.setLoading(false);

          // Get user & save to localStorage
          $http.get('/api/user/').success((data) => {
            $scope.PTApp.$storage.user = data;

            // Get campaign and save to localStorage
            $http.get(`/api/getUserCampaign/${data._id}`).success((campaign) => {
              console.log(`User campaign: ${campaign}`);
              $scope.PTApp.$storage.campaign = campaign;

              // Redirect home
              $state.go('app.home');
            });
          });
        },
      ],
    })

    /* *****************
    ***** CAMPAIGN *****
    ***************** */

    .state('app.campaign', {
      abstract: true,
      url: 'campaign/',
      params: {
        showMessage: false,
      },
      template: `<div ui-view></div>`,
      onEnter: ['$state', '$localStorage', '$sessionStorage',
        function($state, $localStorage, $sessionStorage) { // eslint-disable-line
          if (!$localStorage.user) {
            $state.go('app.login');
          }

          // NOTE: This should never arise.
          if (!$localStorage.campaign) {
            console.log('NO CAMPAIGN');
          }
      }],
      resolve: {
        showMessage: ['$stateParams', ($stateParams) => {
          return $stateParams.showMessage;
        }],
        aws: ['$http', ($http) => {
          return $http({
            method: 'GET',
            url: '/api/aws',
          }).then((data) => {
            return data;
          });
        }],
      },
      // controller: campaignController(),
    })

    .state('app.campaign.create', {
      url: 'create',
      templateUrl: `${DIR}/campaign/create.html`,
      controller: campaignController(),
      onEnter: ['$state', '$localStorage', '$sessionStorage',
        function($state, $localStorage, $sessionStorage) { // eslint-disable-line
          if ($localStorage.campaign.isComplete) {
            $state.go('app.campaign.edit');
          }
        }],
    })

    .state('app.campaign.edit', {
      url: 'edit',
      params: {
        campaign: undefined,
      },
      templateUrl: `${DIR}/campaign/create.html`,
      controller: campaignController(),
      onEnter: ['$state', '$localStorage', '$sessionStorage', '$stateParams',
        function($state, $localStorage, $sessionStorage, $stateParams) { // eslint-disable-line
          if (!$localStorage.campaign.isComplete) {
            // If campaign is not complete, redirect to campaign create.
            $state.go('app.campaign.create');
          }
      }],
    })

    .state('app.campaign.view', {
      url: 'view/:name',
      params: {
        campaign: undefined,
      },
      templateUrl: `${DIR}/campaign/create.html`,
      resolve: {
        foundCampaign: ['$http', '$stateParams',
          ($http, $stateParams) => {
            if (!$stateParams.campaign) {
              return $http({
                method: 'GET',
                url: `/api/getCampaignByName/${$stateParams.name}`,
              }).then((data) => {
                return data.data;
              });
            }
            return $stateParams.campaign;
          },
        ],
      },
      controller: [
        '$http', '$state', '$scope', 'foundCampaign', '$stateParams',
        function ($http, $state, $scope, foundCampaign, $stateParams) {       // eslint-disable-line
          if (!foundCampaign.isComplete &&                      // Require complete
              foundCampaign.user !== $scope.PTApp.user()._id) { // allow owner
            $state.go('app.pitches');
          } else if (!foundCampaign.isComplete && foundCampaign.user === $scope.PTApp.user()._id) {
            $state.go('app.campaign.create');
          }
          $scope.campaign = foundCampaign;
          $scope.viewing = true;
          $scope.ownCampaign = $scope.PTApp.campaign().user === $scope.campaign.user;
          $scope.getVUrl = () => {
            return $scope.campaign.videoUrl;
          };
        },
      ],
    })

    /* *********************
    ***** END CAMPAIGN *****
    ********************* */

    .state('app.about', {
      url: 'about',
      templateUrl: `${DIR}/about.html`,
    })

    .state('app.login', {
      url: 'login',
      templateUrl: `${DIR}/login.html`,
      controller: ['LoadingService', '$scope', function(LoadingService, $scope) { // eslint-disable-line
        $scope.load = () => {
          LoadingService.setLoading(true);
        };
      }],
    })

    .state('app.pitches', {
      url: 'pitches',
      resolve: {
        campaigns: ['$http', ($http) => {
          return $http({
            method: 'GET',
            url: '/api/getCampaigns',
          }).then((data) => {
            console.log(data);
            console.log(JSON.stringify(data));
            return data.data;
          });
        }],
      },
      templateUrl: `${DIR}/pitches.html`,
      controller: ['$state', '$scope', 'campaigns',
        function($state, $scope, campaigns) { // eslint-disable-line
          $scope.campaigns = campaigns;

          $scope.getPrettyDate = (date) => {
            const d = new Date(date);
            return [(d.getMonth() + 1), d.getDate(), (d.getFullYear() % 100)].join('/');
          };
      }],
    });
  },
]);

PTDirectives.forEach((directive) => {
  directive(PitchTanks);
});
