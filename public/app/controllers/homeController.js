angular.module('appControllers', [])
  .controller('HomeController', function ($scope, AppService) {

    AppService.getHomeStatistics().then(function (data) {
      $scope.statistics = data.data;
    }).catch(function (err) {
      console.log(err);
    });

    $scope.title = 'Bring it home!';

  });