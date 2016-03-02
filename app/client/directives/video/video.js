const myVideoPlayer = app => {
  app.directive('videoPlayer', ['$interval', '$sce', ($interval, $sce) => {
    return {
      restrict: 'E',
      scope: {
        vUrl: '=',
        vId: '='
      },
      link: function ($scope, element, attrs, controller, transcludeFn) {
        // eslint-disable-line

        $scope.$watch('vUrl', (newVal, oldVal) => {
          if (newVal !== oldVal) {
            $scope.trustedUrl = $scope.trustSrc(newVal);
            $scope.init();
          }
        });

        $scope.trustSrc = src => {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.trustedUrl = $scope.trustSrc($scope.vUrl);

        $scope.init = () => {
          $scope.getV = () => {
            if (!$scope.dirVideo) {
              $scope.dirVideo = $(`#${ $scope.vId }`)[0];
            }
            return $scope.dirVideo;
          };

          $scope.isStopped = () => {
            const v = $scope.getV();
            return v.paused || v.ended;
          };

          $scope.fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

          $scope.isFullScreen = () => {
            return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
          };

          $scope.handleFullscreen = e => {
            if ($scope.isFullScreen()) {
              if (document.exitFullscreen) document.exitFullscreen();else if (document.mozCancelFullScreen) document.mozCancelFullScreen();else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();else if (document.msExitFullscreen) document.msExitFullscreen();
              $scope.setFullscreenData(false);
            } else {
              if ($scope.getV().requestFullscreen) $scope.getV().requestFullscreen();else if ($scope.getV().mozRequestFullScreen) $scope.getV().mozRequestFullScreen();else if ($scope.getV().webkitRequestFullScreen) $scope.dirVideo.webkitRequestFullScreen(); // eslint-disable-line
              else if ($scope.getV().msRequestFullscreen) $scope.getV().msRequestFullscreen();
              $scope.setFullscreenData(true);
            }
          };

          $scope.setFullscreenData = state => {
            $scope.getV().setAttribute('data-fullscreen', !!state);
          };

          $scope.showControls = e => {
            e.stopPropagation();
            if (!$scope.isStopped()) {
              $(e.currentTarget).find('#fullscreenButton').css({ top: '10px' });
              $(e.currentTarget).find('#menuBar').css({ bottom: '6px' });
            }
          };

          $scope.hideControls = e => {
            e.stopPropagation();
            if (!$scope.isStopped()) {
              $(e.currentTarget).find('#fullscreenButton').css({ top: '-25px' });
              $(e.currentTarget).find('#menuBar').css({ bottom: '-28px' });
            }
          };

          $scope.seekBarChange = () => {
            // Calculate the new time
            const time = $scope.getV().duration * ($scope.seekBarValue / 100);

            // Update the video time
            $scope.getV().currentTime = time;
          };

          $scope.getCurrentTime = () => {
            const vid = element.find(`#${ $scope.vId }`);
            if (vid) {
              return $(vid)[0].currentTime;
            }
            return 0;
          };

          // Update seek bar
          $interval(() => {
            if (!$scope.isStopped() && $scope.getV()) {
              $scope.seekBarValue = 100 / $scope.getV().duration * $scope.getV().currentTime;
            }
          }, 100);

          $scope.playVideo = e => {
            // Get button & menubar
            const button = $($(e.currentTarget)[0]);
            const menuBar = $(e.currentTarget).siblings('#menuBar');
            const fullscreenButton = $(e.currentTarget).siblings('#fullscreenButton');

            // What to do when vid is not playing
            const endVid = () => {
              button.css({
                opacity: '1'
              });
              fullscreenButton.css({ top: '-25px' });
              menuBar.css({ bottom: '-28px' });
              $scope.seekBarValue = 0;
            };

            if ($scope.isStopped()) {
              $scope.getV().play();
              button.css({
                opacity: '0'
              });
              $scope.getV().onended = endVid;
            } else {
              $scope.getV().pause();
              endVid();
            }
          };
        };
        if ($scope.vUrl) {
          $scope.init();
        }
      },
      templateUrl: '/client/directives/video/video.html'
    };
  }]);
};