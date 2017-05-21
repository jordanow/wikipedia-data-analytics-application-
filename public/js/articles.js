// Load the Visualization API and the corechart package.
google.charts.load('current', {
  'packages': ['corechart']
});

// Extracts a given parameter from the window url
var getParameterByName = function (name, url) {
  if (!url) url = window.location.href;
  name = name.replace(/[\[\]]/g, "\\$&");
  var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
    results = regex.exec(url);
  if (!results) return null;
  if (!results[2]) return '';
  return decodeURIComponent(results[2].replace(/\+/g, " "));
};

$(document).ready(function () {
  $("#user-based-chart").submit(function (e) {
    //prevent Default functionality
    e.preventDefault();
    // Fetch the chart data for bar chart 2
    $.getJSON('/api/charts/article/bar2/?search=' + getParameterByName('search') + '&' + $("#user-based-chart").serialize(), drawBarChart2);
  });


  var getData = function () {
    // Fetch list of articles
    $.getJSON('/api/articles/list', null, populateArticleList);

    // Fetch the chart data for pie chart
    $.getJSON('/api/charts/article/pie/?search=' + getParameterByName('search'), drawPieChart);

    // Fetch the chart data for bar chart 1
    $.getJSON('/api/charts/article/bar1/?search=' + getParameterByName('search'), drawBarChart1);
  };

  var populateArticleList = function (data) {
    data.articles.map(function (article) {
      $('#articleList').append("<option value='" + article._id + ' - ' + article.count + " revisions" + "'>");
    });
  };

  var drawBarChart2 = function (res) {
    var chartData = res.chartData;
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

    var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart-3'));
    barChart.draw(data, options);
  };

  // Callback that creates and populates a data table,
  // instantiates the pie chart, passes in the data and
  // draws it.
  var drawBarChart1 = function (res) {
    var chartData = res.chartData;
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

    var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart-2'));
    barChart.draw(data, options);
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
    var pieChart = new google.visualization.PieChart(document.getElementById('pie-chart-2'));
    pieChart.draw(data, options);
  };

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(getData);
});