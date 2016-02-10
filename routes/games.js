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
			newGame.save( function(err, game) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
				else {
					res.json({ status : 'OK, game added',
						id: game._id });
				}
			});
		});
	});
});

router.get('/:game_id', function(req, res) {
	Game.findOne({ "_id": req.params.game_id }, function(err) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	})
	.populate({ path: "teams.team", select: "team_name"})
	.lean()
	.then( function(game) {
		if ( game === null ) {
			res.status(500).json({ status : "Error, game " + req.params.game_id + " is not found" });
		}
		else {
			res.json(game);
		}
	});
});

var finalise_schema = Joi.object ({
	"winner": Joi.string().alphanum().min(1).required()
});


router.post('/:game_id/finalise', function(req, res) {
	Joi.validate(req.body, finalise_schema, function (err, valid_winner) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err });
		}
		else {
			Game.findOne({ "_id": req.params.game_id }, function(err) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
			})
			.populate({ path: "teams.team", select: "team_name"})
			.then( function(game) {
				if ( game === null ) {
					res.status(500).json({ status : "Error, game " + req.params.game_id + " is not found" });
				} else if ( game.finished != null) {
					res.status(500).json({ status : "Error, game " + req.params.game_id + " has already finished!" });
				}
				else {
					team_number = game.teams.findIndex( function(team_details){
						if (team_details.team.team_name == valid_winner.winner) {
							return true
						}
						return false;
					})
					if (team_number == -1) {
						res.status(500).json({ status : "Error, team " + valid_winner.winner + " is not in game " + req.params.game_id });
					} else {
						game.teams[team_number].winner = true;
						res.json({ status : 'OK, ' + valid_winner.winner + ' won the game',
							id: game._id
						});
						game.finished = Date.now();
						game.save();
					}
				}
			});
		}
	});
});

module.exports = router;