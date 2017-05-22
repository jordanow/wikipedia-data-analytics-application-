angular.module('wikipediaApp', [
    'ngRoute',
    'angularSpinner',
    'appControllers',
    'appRoutes',
    'appServices',
    'ngToast'
  ])
  .constant('_', window._);