angular.module('appControllers', [])
  .controller('HomeController', function ($scope, AppService, ngToast) {

    AppService.getHomeStatistics().then(function (data) {
      $scope.statistics = data.data;
    }).catch(function (err) {
      ngToast.create({
        className: 'danger',
        content: err.message,
        timeout: 6000
      });
    });

    $scope.title = 'Bring it home!';

  });