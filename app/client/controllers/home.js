const homeController = () => {
  return ['$scope', '$state',
    function (                             // eslint-disable-line func-names
      $scope, $state
    ) {
      $scope.video = (e) => {
        const button = $(($(e.currentTarget))[0]);
        const clickedVid = button.attr('data-video');
        const v = $(`#${clickedVid}`)[0];
        console.log(v);

        if (v.paused || v.ended) {
          v.play();
          button.css({
            opacity: '0',
          });
          v.onended = () => {
            button.css({
              opacity: '1',
            });
          };
        } else {
          v.pause();
          button.css({
            opacity: '1',
          });
        }
      };
      $scope.battle = {
        video1: '/public/videos/big_buck_bunny.mp4',
        video2: '/public/videos/small.webm',
      };
    },
  ];
};
