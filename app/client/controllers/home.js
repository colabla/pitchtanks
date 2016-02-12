const homeController = () => {
  return ['$scope', '$state',
    function (                             // eslint-disable-line func-names
      $scope, $state
    ) {
      $scope.battle = {
        video1: '/public/videos/big_buck_bunny.mp4',
        video2: '/public/videos/small.webm',
      };
    },
  ];
};
