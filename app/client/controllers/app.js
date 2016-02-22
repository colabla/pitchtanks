const appController = (DIR) => {
  return ['$scope', '$state', 'LoadingService', '$localStorage', '$sessionStorage',
    function (                             // eslint-disable-line func-names
      $scope, $state, LoadingService,
      $localStorage, $sessionStorage
    ) {
      // Vars to be accessed throughout the app.
      $scope.PTApp = {
        storedVals: [
          'user',
          'campaign',
        ],
        $storage: $localStorage,
        user: () => {
          return $scope.PTApp.$storage.user;
        },
        campaign: () => {
          return $scope.PTApp.$storage.campaign;
        },
      };
      $scope.templates = {
        header: `${DIR}/shared/header.html`,
        footer: `${DIR}/shared/footer.html`,
      };

      $scope.loading = LoadingService.isLoading;

      $scope.logout = () => {
        $scope.PTApp.storedVals.forEach((val) => {
          delete $scope.PTApp.$storage[val];
        });
        $state.go('app.home');
      };

      $scope.header = {
        hasCampaign: () => {
          return $scope.PTApp.$storage.user && $scope.PTApp.$storage.user.campaign;
        },
      };
    },
  ];
};
