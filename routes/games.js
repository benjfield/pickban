var express = require('express');
var router = express.Router();
var Game = require('../lib/game');
var Team = require('../lib/team');
var Joi = require('joi');
var mongoose = require('mongoose');
var promise = new mongoose.Promise;

function get_team_from_name(team_name) {
	return Team.findOne({ "team_name": team_name })
	.lean()
	.exec();
}

router.get('/gamelist', function(req, res) {
	Game.find({})
	.populate({ path: "teams.team", select: "team_name"})
	.exec()
	.then( function(games) {
		res.json(games);
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
});

router.get('/finished', function(req, res) {
	Game.find({ finished: { $ne: null} })
	.populate({ path: "teams.team", select: "team_name"})
	.exec()
	.then( function(games) {
		res.json(games);
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
});

router.get('/unfinished', function(req, res) {
	Game.find({ finished: null })
	.populate({ path: "teams.team", select: "team_name"})
	.exec()
	.then( function(games) {
		res.json(games);
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
});

router.delete('/unfinished', function(req, res) {
	Game.remove({ finished: null })
	.exec()
	.then( function(result){
		res.json({ status: "Deleted all unfinished games"})
	}, function (err) {
		console.log(err);
		res.status(500).json({ status : err});
	})
});

router.post('/newgame', function(req, res) {
	var game_details = req.body;
	Promise.all([get_team_from_name(game_details.teams[0].team), get_team_from_name(game_details.teams[1].team)])
	.then( function(results) {
		if (results[0] === null) {
			console.log("Error, team " + game_details.teams[0].team + " is not found");
			res.status(500).json({ status : "Error, team " + game_details.teams[0].team + " is not found"});
		} else if (results[1] === null) {
			console.log("Error, team " + game_details.teams[0].team + " is not found");
			res.status(500).json({ status : "Error, team " + game_details.teams[1].team + " is not found"});
		} else {
			game_details.teams[0].team = results[0]._id;
			game_details.teams[1].team = results[1]._id;

			game_details.created = Date.now();
	
			var newGame = Game(game_details);
			newGame.save( function(err, game) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
				else {
					res.json({ 
						status : 'OK, game added',
						id: game._id 
					});
				}
			});
		}
	}, function(err){
		console.log(err);
		res.status(500).json({ status : err});
	});
});

router.get('/gamelist', function(req, res) {
	Game.find({})
	.populate({ path: "teams.team", select: "team_name"})
	.exec()
	.then( function(games) {
		res.json(games);
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
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

var finish_schema = Joi.object ({
	"winner": Joi.string().alphanum().min(1).required()
});


router.post('/:game_id/finish', function(req, res) {
	Joi.validate(req.body, finish_schema, function (err, valid_winner) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err });
		}
		else {
			Game.findOne({ "_id": req.params.game_id })
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
			}, function(err){
				console.log(err);
				res.status(500).json({ status : err});
			});
		}
	});
});

var pickban_schema = Joi.object ({
	"team": Joi.string().alphanum().min(1).required(),
	"hero": Joi.string().alphanum().min(1).required(),
	"pickban": Joi.required().valid(['pick','ban'])
});


router.post('/:game_id/pickban', function(req, res) {
	Joi.validate(req.body, pickban_schema, function (err, valid_pickban) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err });
		}
		else {
			Game.findOne({ "_id": req.params.game_id })
			.populate({ path: "teams.team", select: "team_name"})
			.then( function(game) {
				if ( game === null ) {
					res.status(500).json({ status : "Error, game " + req.params.game_id + " is not found" });
				} else if ( game.finished != null) {
					res.status(500).json({ status : "Error, game " + req.params.game_id + " has already finished!" });
				}
				else {
					team_number = game.teams.findIndex( function(team_details){
						if (team_details.team.team_name == valid_pickban.team) {
							return true
						}
						return false;
					})
					if (team_number == -1) {
						res.status(500).json({ status : "Error, team " + valid_pickban.team + " is not in game " + req.params.game_id });
					} else {
						if ( valid_pickban.pickban == pick ) {
							if ( game.teams[team_number].picks.length >= 2) {
								res.status(500).json({ status : "Error, " + valid_pickban.team + " in game " + req.params.game_id + " already has 2 picks" });
							} else {
								game.teams[team_number].picks.push(valid_pickban.hero);
								res.json({ status : 'OK, ' + valid_pickban.team + ' picked hero ' + valid_pickban.hero});
							}
						} else {
							if ( game.teams[team_number].bans.length >= 2) {
								res.status(500).json({ status : "Error, " + valid_pickban.team + " in game " + req.params.game_id + " already has 2 bans" });
							} else {
								game.teams[team_number].bans.push(valid_pickban.hero);
								res.json({ status : 'OK, ' + valid_pickban.team + ' banned hero ' + valid_pickban.hero});
							}
						}
						game.save();
					}
				}
			}, function(err){
				console.log(err);
				res.status(500).json({ status : err});
			});
		}
	});
});

module.exports = router;