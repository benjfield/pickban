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
	}).populate({ path: "radiant", select: "team_name"})
	.populate({ path: "first_pick", select: "team_name"})
	.populate({ path: "teams", select: "team_name"})
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
	Team.findOne({ "team_name": game_details.teams[0] }, function(err) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	}).then( function(team0) {
		if ( team0 === null ) {
			console.log("Error, team " + game_details.teams[0] + " is not found");
			return res.status(500).json({ status : "Error, team " + game_details.teams[0] + " is not found"});
		}

		teamsInGame[game_details.teams[0]] = team0._id;

		Team.findOne({ "team_name": game_details.teams[1] }, function(err) {
			if (err) {
				console.log(err);
				res.status(500).json({ status : err});
			} 
		}).then( function(team1) {
			if ( team1 === null ) {
				console.log("Error, team " + game_details.teams[1] + " is not found");
				return res.status(500).json({ status : "Error, team " + game_details.teams[1] + " is not found"});
			}

			teamsInGame[game_details.teams[1]] = team1._id;

			game_details.teams = game_details.teams.map( function (team_name)  {
				return teamsInGame[team_name];
			});
			game_details.radiant = teamsInGame[game_details.radiant];
			game_details.first_pick = teamsInGame[game_details.first_pick];

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