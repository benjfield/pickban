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
	var gameDetails = req.body;
	gameDetails.teams.map( function (team_name) {
		returnID(team_name);
	});
	gameDetails.
	var newGame = Game(gameDetails);
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