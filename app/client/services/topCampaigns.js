'use strict';

angular.module('pitchTanks').factory('TopCampaigns', ['$http', '$localStorage', ($http, $localStorage) => {
  let promise;
  const refreshPeriod = 3600000;

  const setTopCampaign = (campaign, i) => {
    $localStorage.topCampaigns.data[i] = campaign;
    console.log($localStorage.topCampaigns.data);
    return $localStorage.topCampaigns.data;
  };

  const getTopCampaigns = () => {
    // Function for refreshing campaign data.
    const refreshTopCampaigns = () => {
      if (!promise) {
        promise = $http({
          method: 'GET',
          url: '/api/getTopCampaigns'
        }).then(data => {
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
      console.log(`Refreshing from timestamp: ${ Date.now() - $localStorage.topCampaignsTimestamp }`); // eslint-disable-line
      // Expired, refresh.
      return refreshTopCampaigns();
    }

    // No top campaigns, return empty list.
    return $localStorage.topCampaigns;
  };
  return {
    getTopCampaigns,
    setTopCampaign
  };
}]);