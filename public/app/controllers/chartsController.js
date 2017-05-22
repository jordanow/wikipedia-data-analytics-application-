angular.module('appControllers')
  .controller('ChartsController', function ($scope, AppService, ngToast) {
    $scope.loadedBarChart = false;
    $scope.loadedPieChart = false;

    $scope.selectedTab = 'bar-chart-tab';

    $scope.selectTab = function (tab) {
      $scope.selectedTab = tab;
    };

    google.charts.setOnLoadCallback(function () {
      AppService.getBarChart().then(function (data) {
        var chartData = data.data.chartData;
        $scope.loadedPieChart = true;
        drawBarChart(chartData);
      }).catch(function (err) {
        ngToast.create({
          className: 'danger',
          content: err.message,
          timeout: 6000
        });
      });

      AppService.getPieChart().then(function (data) {
        var chartData = data.data;
        $scope.loadedBarChart = true;
        drawPieChart(chartData);
      }).catch(function (err) {
        ngToast.create({
          className: 'danger',
          content: err.message,
          timeout: 6000
        });
      });
    });
  });


// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
var drawBarChart = function (chartData) {
  // Create the data table.
  var data = new google.visualization.arrayToDataTable(chartData);

  // Set chart options
  var options = {
    'title': 'Revision number distribution by year and by user type',
    'width': 800,
    'height': 500,
    hAxis: {
      title: 'Timestamp',
      slantedText: true,
      slantedTextAngle: 90,
    },
    vAxis: {
      title: "Number of revisions"
    }
  };

  var barChartDiv = document.getElementById('bar-chart');

  if (barChartDiv) {
    var barChart = new google.visualization.ColumnChart(barChartDiv);
    barChart.draw(data, options);
  }
};

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
var drawPieChart = function (chartData) {

  // Create the data table.
  var data = new google.visualization.DataTable();
  data.addColumn('string', 'User type');
  data.addColumn('number', 'Revisions made');
  data.addRows(chartData);

  // Set chart options
  var options = {
    'title': 'Revision number distribution by user type',
    'width': 800,
    'height': 500
  };

  // Instantiate and draw our chart, passing in some options.
  var pieChartDiv = document.getElementById('pie-chart');
  if (pieChartDiv) {
    var pieChart = new google.visualization.PieChart(pieChartDiv);
    pieChart.draw(data, options);
  }
};