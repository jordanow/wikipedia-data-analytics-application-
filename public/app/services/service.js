angular.module('appServices', [])
  .factory('AppService', function ($http) {
    var getHomeStatistics = function () {
      return $http.get('/api/home/statistics');
    };


    return {
      getHomeStatistics: getHomeStatistics
    };
  });