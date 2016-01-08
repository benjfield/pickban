var mongoose = require('mongoose');
//var ObjectId = mongoose.Schema.ObjectId;
var Schema = mongoose.Schema;

// create a schema
var teamSchema = new Schema({
	//_id: ObjectId,
	team_name: { type: String, unique: true },
	players: Array
});

// the schema is useless so far
// we need to create a model using it
var Team = mongoose.model('Team', teamSchema);

// make this available to our users in our Node applications
module.exports = Team;	