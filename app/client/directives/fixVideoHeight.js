directive('fixVideoHeight', ['$timeout', function ($timeout) {
    // eslint-disable-line
    // http://stackoverflow.com/questions/16935766/run-jquery-code-after-angularjs-completes-rendering-html
    return {
        link: ($scope, element, attrs) => {
            $scope.$on('dataloaded', () => {
                $timeout(() => {
                    // Fix for height mismatch.
                    const vp1 = $($('.vs-panel')[0]);
                    const vp2 = $($('.vs-panel')[1]);
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