angular.module('pitchTanks', [
  'ui.router',
])

.run(
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
      controller: ['$scope', '$state', 'AuthService',
        function ($scope, $state, AuthService) { // eslint-disable-line func-names
          $scope.templates = {
            header: `${DIR}/shared/header.html`,
            footer: `${DIR}/shared/footer.html`,
          };

          $scope.user = () => {
            return AuthService.getUser();
          };
        },
      ],
    })

    .state('app.home', {
      url: '',
      templateUrl: `${DIR}/home.html`,
    })

    .state('app.loggedIn', {
      url: 'login/accept',
      templateUrl: `${DIR}/login.html`,
      controller: [
        '$http', '$state', 'AuthService',
        function ($http, $state, AuthService) { // eslint-disable-line func-names
          $http.get('/api/user/').success((data) => {
            AuthService.setUser(data);
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
