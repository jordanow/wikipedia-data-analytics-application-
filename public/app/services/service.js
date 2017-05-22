angular.module('appServices', [])
  .factory('AppService', function ($http) {
    var getHomeStatistics = function () {
      return $http.get('/api/home/statistics');
    };

    var getBarChart = function () {
      return $http.get('/api/charts/home/bar');
    };

    var getPieChart = function () {
      return $http.get('/api/charts/home/pie');
    };

    return {
      getHomeStatistics: getHomeStatistics,
      getBarChart: getBarChart,
      getPieChart: getPieChart
    };
  });