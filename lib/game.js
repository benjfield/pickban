var mongoose = require('mongoose');
var Schema = mongoose.Schema;
var ObjectId = mongoose.Schema.ObjectId;

// create a schema
var gameSchema = new Schema({
	//_id: ObjectId,
	teams: [{ type: Schema.Types.ObjectId, ref: 'Team' }],
	radiant: { type: Schema.Types.ObjectId, ref: 'Team' },
	first_pick: { type: Schema.Types.ObjectId, ref: 'Team' },
});

// the schema is useless so far
// we need to create a model using it
var Game = mongoose.model('Game', gameSchema);

// make this available to our users in our Node applications
module.exports = Game;