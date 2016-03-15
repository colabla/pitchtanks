'use strict';

angular.module('pitchTanks').factory('LoadingService', [function () {
  var loading = false;

  function isLoading() {
    return loading;
  }

  function setLoading(val) {
    loading = val;
  }
  return {
    isLoading: isLoading,
    setLoading: setLoading
  };
}]);