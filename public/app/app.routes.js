angular.module('appRoutes', [])
  .config(['$routeProvider', '$locationProvider', function ($routeProvider, $locationProvider) {

    $routeProvider
      // home page
      .when('/', {
        templateUrl: 'views/home.html',
        controller: 'HomeController'
      })
      .when('/summary-charts', {
        templateUrl: 'views/charts.html',
        controller: 'ChartsController'
      })
      .when('/article', {
        templateUrl: 'views/article.html',
        controller: 'ArticleController'
      })
      .otherwise({redirectTo:'/'});

    $locationProvider.html5Mode(true);

  }]);