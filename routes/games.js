var express = require('express');
var router = express.Router();
var Game = require('../lib/game');
var Team = require('../lib/team');
var Joi = require('joi');

router.get('/gamelist', function(req, res) {
	Game.find({}, function(err, games) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json(games);
		}
	});
});

function returnID(team_name, callback) {
	var id; 
	Team.findOne ( { "team_name": team_name }, function (err, team) {
		if  (err) {
			callback(err);
		}
		if ( team === null ) {
			callback(err);
		}
		else {
			console.log(team._id);
			id = team._id;
		}
	});
	console.log("id is " + id);
	return id;
}

router.post('/newgame', function(req, res) {
	var game_details = req.body;
	on_error = function (err) {
		console.log(err);
		res.status(500).json({ status : err});
	};
	game_details.teams.map( function (team_name)  {
		console.log(team_name);
		return returnID(team_name, on_error);
	});
	console.log(game_details.radiant);
	game_details.radiant = returnID(game_details.radiant, on_error);
	game_details.first_pick = returnID(game_details.first_pick, on_error);
	var newGame = Game(game_details);
	newGame.save( function(err) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json({ status : 'OK, team added' });
		}
	});
});

module.exports = router;