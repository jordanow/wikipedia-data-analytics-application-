// Load the Visualization API and the corechart package.
google.charts.load('current', {
  'packages': ['corechart']
});

$(document).ready(function () {
  var getData = function () {
    // Fetch list of articles
    $.getJSON('/api/articles/list', null, populateArticleList);
  };

  var populateArticleList = function (data) {
    data.articles.map(function (article) {
      $('#articleList').append("<option value='" + article._id + ' - ' + article.count + " revisions" + "'>");
    });
  };

  // Set a callback to run when the Google Visualization API is loaded.
  google.charts.setOnLoadCallback(getData);
});