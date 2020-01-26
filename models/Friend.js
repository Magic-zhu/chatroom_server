const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const Friend = new Schema({
    user:  String,
    user_friends: Schema.Types.Mixed,
    create_time:Date,
    update_time:Date,
  });
  module.exports = Friend;