var express = require('express');
var router = express.Router();
var Game = require('../lib/game')(mongoose);
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

function returnID(team_name) {
	Team.findOne ( { team_name: team_name }, function (err, team) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		if ( team === null ) {
			console.log("Error, team" + team_name + " is not found");
			res.status(500).json({ status : "Error, team " + team_name + " is not found" });
		}
		else {
			return team._id;
		}
	});
}

router.post('/newgame', function(req, res) {
	var game_details = req.body;
	game_details.teams.map( function (team_name) {
		returnID(team_name);
	});
	game_details.radiant = returnID(game_details.radiant);
	game_details.first_pick = returnID(game_details.first_pick);
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