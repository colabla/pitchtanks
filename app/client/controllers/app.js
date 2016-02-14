const appController = (DIR) => {
  return ['$scope', '$state', '$localStorage', '$sessionStorage',
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

      $scope.header = {
        getCampaignLinkCopy: () => {
          return $scope.$storage.user && $scope.$storage.user.campaign ?
            'My Campaign' : 'Create a Campaign';
        },
      };
    },
  ];
};
