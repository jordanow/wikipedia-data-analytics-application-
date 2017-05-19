 // Load the Visualization API and the corechart package.
 google.charts.load('current', {
   'packages': ['corechart']
 });

 $(document).ready(function () {
   var getData = function () {
     // Fetch the chart data from home/charts api
     $.getJSON('/home/charts', null, function (data) {
       drawChart(data);
     });
   };

   // Callback that creates and populates a data table,
   // instantiates the pie chart, passes in the data and
   // draws it.
   var drawChart = function (chartData) {

     // Create the data table.
     var data = new google.visualization.DataTable();
     data.addColumn('string', 'User type');
     data.addColumn('number', 'Revisions made');
     data.addRows(chartData);

     // Set chart options
     var options = {
       'width': 800,
       'height': 500
     };

     // Instantiate and draw our chart, passing in some options.
     var pieChart = new google.visualization.PieChart(document.getElementById('pie-chart-1'));
     pieChart.draw(data, options);

     var barChart = new google.visualization.BarChart(document.getElementById('bar-chart-1'));
     barChart.draw(data, options);
   };

   // Set a callback to run when the Google Visualization API is loaded.
   google.charts.setOnLoadCallback(getData);
 });