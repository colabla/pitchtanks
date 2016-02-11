'use strict';

angular.module('pitchTanks').factory(
  'AuthService',
  [
    '$q', '$timeout', '$http',
    ($q, $timeout, $http) => {
      let user;

      function isLoggedIn() {
        if (user) {
          return true;
        }
        return false;
      }

      function setUser(u) {
        user = u;
      }

      function getUser() {
        return user;
      }

      return ({
        isLoggedIn,
        getUser,
        setUser,
      });
    },
  ]
);
