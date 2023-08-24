const {Schema, model} = require("mongoose")

const friendsSchema = new Schema({
    userId: {type: String, unique: true, required: true},
    friends: {type: [String]},
    requests: {type: [String]},
  });

module.exports = model("Friends", friendsSchema);