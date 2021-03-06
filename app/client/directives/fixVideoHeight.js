'use strict';

directive('fixVideoHeight', ['$timeout', function ($timeout) {
    
    // http://stackoverflow.com/questions/16935766/run-jquery-code-after-angularjs-completes-rendering-html
    return {
        link: function ($scope, element, attrs) {
            $scope.$on('dataloaded', function () {
                $timeout(function () {
                    // Fix for height mismatch.
                    var vp1 = $($('.vs-panel')[0]);
                    var vp2 = $($('.vs-panel')[1]);
                    console.log(vp1.height());
                    console.log(vp2.height());
                    if (vp1.height() > vp2.height()) {
                        vp2.css({ height: vp1.height() });
                    } else {
                        vp1.css({ height: vp2.height() });
                    }
                }, 0, false);
            });
        }
    };
}]);