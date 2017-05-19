 // Load the Visualization API and the corechart package.
 google.charts.load('current', {
   'packages': ['corechart']
 });

 $(document).ready(function () {
   var getData = function () {
     // Fetch the chart data from home/charts/pie api
     $.getJSON('/home/charts/pie', null, drawPieChart);

     // Fetch the chart data from home/charts/bar api
     $.getJSON('/home/charts/bar', null, drawBarChart);
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
   var drawBarChart = function (chartData) {

     // Create the data table.
     var data = new google.visualization.arrayToDataTable(chartData);

     // Set chart options
     var options = {
       'title': 'Revision number distribution by year and by user type',
       'width': 800,
       'height': 500
     };

     var barChart = new google.visualization.ColumnChart(document.getElementById('bar-chart-1'));
     barChart.draw(data, options);
   };

   // Set a callback to run when the Google Visualization API is loaded.
   google.charts.setOnLoadCallback(getData);
 });