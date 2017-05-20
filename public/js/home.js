 // Load the Visualization API and the corechart package.
 google.charts.load('current', {
   'packages': ['corechart']
 });

 $(document).ready(function () {
   var getData = function () {
     // Fetch the chart data from charts/pie api
     $.getJSON('/api/charts/home/pie', null, drawPieChart);

     // Fetch the chart data from charts/bar api
     $.getJSON('/api/charts/home/bar', null, drawBarChart);

     // Fetch list of articles
     $.getJSON('/api/articles/list', null, populateArticleList);
   };

   var populateArticleList = function (data) {
     data.articles.map(function (article) {
       $('#articleList').append("<option value='" + article._id + ' - ' + article.count + " revisions" + "'>");
     });
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
     var pieChart = new google.visualization.PieChart(document.getElementById('pie-chart-1'));
     pieChart.draw(data, options);
   };

   // Callback that creates and populates a data table,
   // instantiates the pie chart, passes in the data and
   // draws it.
   var drawBarChart = function (res) {
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

     var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart-1'));
     barChart.draw(data, options);
   };

   // Set a callback to run when the Google Visualization API is loaded.
   google.charts.setOnLoadCallback(getData);
 });