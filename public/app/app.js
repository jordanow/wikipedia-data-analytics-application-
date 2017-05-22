angular.module('wikipediaApp', [
    'ngRoute',
    'angularSpinner',
    'appControllers',
    'appRoutes',
    'appServices'
  ])
  .constant('_', window._);