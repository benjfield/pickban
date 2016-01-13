var express = require('express');
var router = express.Router();
var Game = require('../lib/game');
var Team = require('../lib/team');
var Joi = require('joi');
var mongoose = require('mongoose');
var promise = new mongoose.Promise;

router.get('/gamelist', function(req, res) {
	Game.find({}, function(err) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	}).populate({ path: "teams.team", select: "team_name"})
	.exec( function(err,games) {
		if  (err) {
			console.log(err);
			return res.status(500).json({ status : err});
		}
		res.json(games);
	});
});

router.post('/newgame', function(req, res) {
	var game_details = req.body;
	var teamsInGame = {};
	Team.findOne({ "team_name": game_details.teams[0].team }, function(err) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	}).then( function(team0) {
		if ( team0 === null ) {
			console.log("Error, team " + game_details.teams[0].team + " is not found");
			return res.status(500).json({ status : "Error, team " + game_details.teams[0].team + " is not found"});
		}

		game_details.teams[0].team = team0._id;

		Team.findOne({ "team_name": game_details.teams[1].team }, function(err) {
			if (err) {
				console.log(err);
				res.status(500).json({ status : err});
			} 
		}).then( function(team1) {
			if ( team1 === null ) {
				console.log("Error, team " + game_details.teams[1].team + " is not found");
				return res.status(500).json({ status : "Error, team " + game_details.teams[1].team + " is not found"});
			}

			game_details.teams[1].team = team1._id;

			game_details.created = Date.now();

			console.log(game_details);
	
			var newGame = Game(game_details);
			newGame.save( function(err) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
				else {
					res.json({ status : 'OK, game added' });
				}
			});
		});
	});
});

module.exports = router;