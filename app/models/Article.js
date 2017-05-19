// Libraries
var mongoose = require('mongoose');

// Define the schema
var articleSchema = new mongoose.Schema({
  parentid: Number,
  parsedcomment: String,
  revid: Number,
  sha1: String,
  size: Number,
  timestamp: String,
  title: String,
  user: String
});

// the schema is useless so far
// we need to create a model using it
var Article = mongoose.model('Article', articleSchema);

// make this available to our articles in our Node applications
module.exports = Article;