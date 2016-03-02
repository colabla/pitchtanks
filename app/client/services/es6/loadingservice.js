'use strict';

angular.module('pitchTanks').factory(
  'LoadingService',
  [() => {
      let loading = false;

      function isLoading() {
        return loading;
      }

      function setLoading(val) {
        loading = val;
      }
      return ({
        isLoading,
        setLoading,
      });
    },
  ]
);
