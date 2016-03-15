'use strict';

angular.module('pitchTanks').factory('TopCampaigns', ['$http', '$localStorage', function ($http, $localStorage) {
  var promise = undefined;
  var refreshPeriod = 3600000;

  var setTopCampaign = function setTopCampaign(campaign, i) {
    $localStorage.topCampaigns.data[i] = campaign;
    console.log($localStorage.topCampaigns.data);
    return $localStorage.topCampaigns.data;
  };

  var getTopCampaigns = function getTopCampaigns() {
    // Function for refreshing campaign data.
    var refreshTopCampaigns = function refreshTopCampaigns() {
      if (!promise) {
        promise = $http({
          method: 'GET',
          url: '/api/getTopCampaigns'
        }).then(function (data) {
          $localStorage.topCampaigns = data;
          $localStorage.topCampaignsTimestamp = Date.now();
          return data;
        });
      }
      return promise;
    };
    console.log('Here');
    // Initialize, if necessary
    if (!$localStorage.topCampaigns) {
      $localStorage.topCampaigns = [];
      $localStorage.topCampaignsTimestamp = Date.now();
    }
    if (!$localStorage.topCampaigns.length) {
      console.log('refreshing');
      // Haven't looked yet, refresh.
      return refreshTopCampaigns();
    } else if (Date.now() - $localStorage.topCampaignsTimestamp < refreshPeriod) {
      // eslint-disable-line
      console.log('Refreshing from timestamp: ' + (Date.now() - $localStorage.topCampaignsTimestamp)); // eslint-disable-line
      // Expired, refresh.
      return refreshTopCampaigns();
    }

    // No top campaigns, return empty list.
    return $localStorage.topCampaigns;
  };

  var optionallyAppendCampaign = function(campaign, topCampaigns) {
    // Check for small numbers of campaigns
    if (topCampaigns.length < 2 && campaign.isComplete) {
      var add = true;
      for (var i = 0; i < topCampaigns.length; i++) {
        if (topCampaigns[i].user === campaign.user) {
          add = false;
        }
      }
      if (add) {
        topCampaigns.push(campaign);
      }
    }
    return topCampaigns;
  };
  return {
    getTopCampaigns: getTopCampaigns,
    setTopCampaign: setTopCampaign,
    optionallyAppendCampaign: optionallyAppendCampaign
  };
}]);
