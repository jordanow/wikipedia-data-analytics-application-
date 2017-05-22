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

    var postArticleBarChart2 = function (articleName, users) {
      return $http.post('/api/charts/article/bar2/' + articleName, {
        users: users
      });
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
      postArticleBarChart2: postArticleBarChart2,
      getArticlePieChart2: getArticlePieChart2
    };
  });