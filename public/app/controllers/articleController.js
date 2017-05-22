angular.module('appControllers')
  .controller('ArticleController', function ($scope, AppService) {
    $scope.loadedBarChart1 = false;
    $scope.loadedBarChart2 = false;
    $scope.loadedPieChart1 = false;

    $scope.articleTitle = '';
    $scope.selectedTab = 'bar-chart-tab-1';

    $scope.selectTab = function (tab) {
      $scope.selectedTab = tab;
    };

    AppService.getArticlesList().then(function (data) {
      $scope.articles = data.data.articles;
    }).catch(function (err) {
      console.log(err);
    });

    $scope.searchArticle = function () {
      AppService.getArticle($scope.articleTitle).then(function (data) {
        $scope.articleData = data.data;
      }).catch(function (err) {
        console.log(err);
      });
    };

    google.charts.setOnLoadCallback(function () {
      // AppService.getArticleBarChart1().then(function (data) {
      //   var chartData = data.data.chartData;
      //   $scope.loadedBarChart1 = true;
      //   drawBarChart1(chartData);
      // }).catch(function (err) {
      //   console.log(err);
      // });

      // AppService.getArticleBarChart2().then(function (data) {
      //   var chartData = data.data.chartData;
      //   $scope.loadedBarChart2 = true;
      //   drawBarChart1(chartData);
      // }).catch(function (err) {
      //   console.log(err);
      // });

      // AppService.getArticlePieChart2().then(function (data) {
      //   var chartData = data.data.chartData;
      //   $scope.loadedPieChart1 = true;
      //   drawPieChart(chartData);
      // }).catch(function (err) {
      //   console.log(err);
      // });
    });
  });

var drawBarChart2 = function (chartData) {
  // Create the data table.
  var data = new google.visualization.arrayToDataTable(chartData);

  // Set chart options
  var options = {
    'title': 'Revision number distribution by user',
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

  var barChartDiv = document.getElementById('bar-chart-3');
  if (barChartDiv) {
    var barChart = new google.visualization.ColumnChart(barChartDiv);
    barChart.draw(data, options);
  }
};

// Callback that creates and populates a data table,
// instantiates the pie chart, passes in the data and
// draws it.
var drawBarChart1 = function (chartData) {
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

  var barChartDiv = document.getElementById('bar-chart-2');
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
    'title': 'Revision distribution by user type',
    'width': 800,
    'height': 500
  };

  // Instantiate and draw our chart, passing in some options.
  var pieChartDiv = document.getElementById('pie-chart-2');
  if (pieChartDiv) {
    var pieChart = new google.visualization.PieChart(pieChartDiv);
    pieChart.draw(data, options);
  }
};