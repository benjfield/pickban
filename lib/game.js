var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;

// create a schema
var gameSchema = new Schema({
	//_id: ObjectId,
	teams: [{
		team: { type: Schema.Types.ObjectId, ref: 'Team'},
		radiant: { type: Boolean },
		first_pick: { type: Boolean },
		bans: [ { type: String, default: null } ],
		picks: [ { type: String, default: null } ],
		winner: { type: Boolean, default: false}
	}],
	created: { type: Date },
	finished: { type: Date, default: null}
});

// the schema is useless so far
// we need to create a model using it
var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;