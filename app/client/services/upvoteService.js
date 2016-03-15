'use strict';

angular.module('pitchTanks').factory('UpvoteService', ['$state', '$http', function ($state, $http) {

  var userHasUpvoted;

  // Upvote handling
  var userCanUpvote = function (user, id) {
    return function() {
      return !userHasUpvoted && (!user || !user.upvotes.includes(id));
    }
  };

  var setUserHasUpvoted = function(newVal) {
    userHasUpvoted = newVal;
  };

  var voteUp = function (userId, campaignId, callback) {
    return function() {
      if (!userId) {
        $state.go('app.login');
      } else {
        setUserHasUpvoted(true);
        $http.post('/api/upvote/' + campaignId + '/' + userId).success(function (data) {
          console.log(data);
          var newData = {
            user: data.user,
            campaign: data.campaign,
          };
          callback(newData);
        });
      }
    };
  };

  return {
    userCanUpvote: userCanUpvote,
    setUserHasUpvoted: setUserHasUpvoted,
    voteUp: voteUp
  };
}]);
