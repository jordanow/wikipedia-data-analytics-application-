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
  var getData = function () {
    // Fetch list of articles
    $.getJSON('/api/articles/list', null, populateArticleList);

    // Fetch the chart data from charts/bar api
    $.getJSON('/api/charts/article/pie/?search=' + getParameterByName('search'), function () {});
  };

  var populateArticleList = function (data) {
    data.articles.map(function (article) {
      $('#articleList').append("<option value='" + article._id + ' - ' + article.count + " revisions" + "'>");
    });
  };

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(getData);
});