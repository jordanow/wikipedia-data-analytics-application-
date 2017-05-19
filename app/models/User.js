// Libraries
var mongoose = require('mongoose');

// Define the schema
var userSchema = new mongoose.Schema({
  name: {
    type: String,
    index: true
  },
  bot: {
    type: Boolean,
    default: false
  }
});

// the schema is useless so far
// we need to create a model using it
var User = mongoose.model('User', userSchema);

// make this available to our users in our Node applications
module.exports = User;