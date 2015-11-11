var mongoose = require('mongoose');
mongoose.connect('mongodb://localhost/pickban');
var ObjectId = require('mongoose').Schema.ObjectId;
var Schema = mongoose.Schema;

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