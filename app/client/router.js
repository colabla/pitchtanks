const PitchTanks = angular.module('pitchTanks', [
  'ui.router',
  'ngStorage',
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
      controller: ['$scope', '$state', '$localStorage', '$sessionStorage',
        function (                             // eslint-disable-line func-names
          $scope, $state,
          $localStorage, $sessionStorage
        ) {
          $scope.$storage = $localStorage;
          $scope.templates = {
            header: `${DIR}/shared/header.html`,
            footer: `${DIR}/shared/footer.html`,
          };
          $scope.logout = () => {
            delete $scope.$storage.user;
          };

          $scope.user = () => {
            return $scope.$storage.user;
          };
        },
      ],
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
        '$http', '$state', '$scope',
        function (                           // eslint-disable-line func-names
          $http, $state, $scope
        ) {
          $http.get('/api/user/').success((data) => {
            $scope.$storage.user = data;
            $state.go('app.home');
          });
        },
      ],
    })

    .state('app.about', {
      url: 'about',
      templateUrl: `${DIR}/about.html`,
    })

    .state('app.login', {
      url: 'login',
      templateUrl: `${DIR}/login.html`,
    })

    .state('app.pitches', {
      url: 'pitches',
      templateUrl: `${DIR}/pitches.html`,
    });
  },
]);
