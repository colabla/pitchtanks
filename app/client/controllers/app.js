const appController = (DIR) => {
  return ['$scope', '$state', 'LoadingService', '$localStorage', '$sessionStorage',
    function (                             // eslint-disable-line func-names
      $scope, $state, LoadingService,
      $localStorage, $sessionStorage
    ) {
      $scope.$storage = $localStorage;
      $scope.templates = {
        header: `${DIR}/shared/header.html`,
        footer: `${DIR}/shared/footer.html`,
      };

      $scope.loading = LoadingService.isLoading;

      $scope.logout = () => {
        delete $scope.$storage.user;
        $state.go('app.home');
      };

      $scope.user = () => {
        return $scope.$storage.user;
      };

      $scope.header = {
        hasCampaign: () => {
          return $scope.$storage.user && $scope.$storage.user.campaign;
        },
      };
    },
  ];
};
