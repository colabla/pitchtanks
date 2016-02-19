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
          $http.get('/api/user/').success((data) => {
            $scope.$storage.user = data;
            $state.go('app.home');
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
      template: `<div ui-view></div>`,
      resolve: {
        aws: ['$http', ($http) => {
          return $http({
            method: 'GET',
            url: '/api/aws',
          });
        }],
      },
      // controller: campaignController(),
    })

    .state('app.campaign.create', {
      url: 'create',
      templateUrl: `${DIR}/campaign/create.html`,
      onEnter: ['$state', '$localStorage', '$sessionStorage',
        function($state, $localStorage, $sessionStorage) { // eslint-disable-line
          if (!$localStorage.user) {
            $state.go('app.login');
          }
      }],
      controller: campaignController(),
    })

    .state('app.campaign.edit', {
      url: 'edit',
      templateUrl: `${DIR}/campaign/edit.html`,
      // controller: campaignEditController(),
    })

    .state('app.campaign.view', {
      url: 'view',
      templateUrl: `${DIR}/campaign/view.html`,
      // controller: campaignViewController(),
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
      templateUrl: `${DIR}/pitches.html`,
    });
  },
]);

PTDirectives.forEach((directive) => {
  directive(PitchTanks);
});
