const homeController = () => {
  return ['$scope', '$state',
    function (                             // eslint-disable-line func-names
      $scope, $state
    ) {
      $scope.battle = {
        video1: '/public/videos/big_buck_bunny.mp4',
        video2: '/public/videos/small.webm',
      };

      $scope.howItWorks = {
        isActive: (i) => {
          return i === $scope.howItWorks.active;
        },
        active: 2,
        anglePos: () => { return `${100 * ($scope.howItWorks.active / 3)}%`; },
        angleColor: () => { return `color${$scope.howItWorks.active}`; },
        descBg: () => { return `bg${$scope.howItWorks.active}`; },
        setActive: (i) => { $scope.howItWorks.active = i; },
      };
      $scope.changeImg = (e, i) => {
        $scope.howItWorks.active = i;
      };
    },
  ];
};
