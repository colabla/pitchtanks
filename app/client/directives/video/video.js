'use strict';

var myVideoPlayer = function (app) {
  app.directive('videoPlayer', ['$interval', '$sce', function ($interval, $sce) {
    return {
      restrict: 'E',
      scope: {
        vUrl: '=',
        vId: '='
      },
      link: function link($scope, element, attrs, controller, transcludeFn) {
        

        $scope.$watch('vUrl', function (newVal, oldVal) {
          if (newVal !== oldVal) {
            $scope.trustedUrl = $scope.trustSrc(newVal);
            $scope.init();
          }
        });

        $scope.trustSrc = function (src) {
          return $sce.trustAsResourceUrl(src);
        };

        $scope.trustedUrl = $scope.trustSrc($scope.vUrl);

        $scope.init = function () {
          $scope.getV = function () {
            if (!$scope.dirVideo) {
              $scope.dirVideo = $('#' + $scope.vId)[0];
            }
            return $scope.dirVideo;
          };

          $scope.isStopped = function () {
            var v = $scope.getV();
            return v.paused || v.ended;
          };

          $scope.fullScreenEnabled = !!(document.fullscreenEnabled || document.mozFullScreenEnabled || document.msFullscreenEnabled || document.webkitSupportsFullscreen || document.webkitFullscreenEnabled || document.createElement('video').webkitRequestFullScreen);

          $scope.isFullScreen = function () {
            return !!(document.fullScreen || document.webkitIsFullScreen || document.mozFullScreen || document.msFullscreenElement || document.fullscreenElement);
          };

          $scope.handleFullscreen = function (e) {
            if ($scope.isFullScreen()) {
              if (document.exitFullscreen) document.exitFullscreen();else if (document.mozCancelFullScreen) document.mozCancelFullScreen();else if (document.webkitCancelFullScreen) document.webkitCancelFullScreen();else if (document.msExitFullscreen) document.msExitFullscreen();
              $scope.setFullscreenData(false);
            } else {
              if ($scope.getV().requestFullscreen) $scope.getV().requestFullscreen();else if ($scope.getV().mozRequestFullScreen) $scope.getV().mozRequestFullScreen();else if ($scope.getV().webkitRequestFullScreen) $scope.dirVideo.webkitRequestFullScreen(); 
              else if ($scope.getV().msRequestFullscreen) $scope.getV().msRequestFullscreen();
              $scope.setFullscreenData(true);
            }
          };

          $scope.setFullscreenData = function (state) {
            $scope.getV().setAttribute('data-fullscreen', !!state);
          };

          $scope.showControls = function (e) {
            e.stopPropagation();
            if (!$scope.isStopped()) {
              $(e.currentTarget).find('#fullscreenButton').css({ top: '10px' });
              $(e.currentTarget).find('#menuBar').css({ bottom: '6px' });
            }
          };

          $scope.hideControls = function (e) {
            e.stopPropagation();
            if (!$scope.isStopped()) {
              $(e.currentTarget).find('#fullscreenButton').css({ top: '-25px' });
              $(e.currentTarget).find('#menuBar').css({ bottom: '-28px' });
            }
          };

          $scope.seekBarChange = function () {
            // Calculate the new time
            var time = $scope.getV().duration * ($scope.seekBarValue / 100);

            // Update the video time
            $scope.getV().currentTime = time;
          };

          $scope.getCurrentTime = function () {
            var vid = element.find('#' + $scope.vId);
            if (vid) {
              return $(vid)[0].currentTime;
            }
            return 0;
          };

          // Update seek bar
          $interval(function () {
            if (!$scope.isStopped() && $scope.getV()) {
              $scope.seekBarValue = 100 / $scope.getV().duration * $scope.getV().currentTime;
            }
          }, 100);

          $scope.playVideo = function (e) {
            // Get button & menubar
            var button = $($(e.currentTarget)[0]);
            var menuBar = $(e.currentTarget).siblings('#menuBar');
            var fullscreenButton = $(e.currentTarget).siblings('#fullscreenButton');

            // What to do when vid is not playing
            var endVid = function endVid() {
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