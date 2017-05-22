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

    var getArticleBarChart1 = function (articleName) {
      return $http.get('/api/charts/article/bar1/' + articleName);
    };

    var getArticleBarChart2 = function (articleName) {
      return $http.get('/api/charts/article/bar2/' + articleName);
    };

    var getArticlePieChart2 = function (articleName) {
      return $http.get('/api/charts/article/pie/' + articleName);
    };

    var getArticle = function (articleName) {
      return $http.get('/api/articles/' + articleName);
    };

    var getArticlesList = function () {
      return $http.get('/api/articles/list');
    };

    return {
      getArticle: getArticle,
      getArticlesList: getArticlesList,
      getHomeStatistics: getHomeStatistics,
      getBarChart: getBarChart,
      getPieChart: getPieChart,
      getArticleBarChart1: getArticleBarChart1,
      getArticleBarChart2: getArticleBarChart2,
      getArticlePieChart2: getArticlePieChart2
    };
  });