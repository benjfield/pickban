var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pickban');
var ObjectId = require('mongoose').Schema.ObjectId;
var Schema = mongoose.Schema;

// create a schema
var userSchema = new Schema({
	//_id: ObjectId,
	team_name: { type: String, unique: true },
	players: Array
});

// the schema is useless so far
// we need to create a model using it
var Team = mongoose.model('Team', userSchema);

// make this available to our users in our Node applications
module.exports = Team;