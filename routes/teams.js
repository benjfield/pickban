var express = require('express');
var router = express.Router();
var Game = require('../lib/game');
var Team = require('../lib/team');
var Joi = require('joi');

// var lib = require('./lib/')
/*
 * GET teamlist.
 */
router.get('/teamlist', function(req, res) {
	Team.find({}, function(err, teams) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json(teams);
		}
	});
});

router.get('/:team_name', function(req, res) {
	Team.findOne({ team_name: req.params.team_name }, function(err) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	}).lean().then( function(team) {
		if ( team === null ) {
			res.status(500).json({ status : "Error, team " + req.params.team_name + " is not found" });
		}
		else {
			Game.count({ "teams": { $elemMatch: { "team": team._id, "winner": true}}, finished: { $ne: null }}, function(err) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
			}).then( function (won_games) {
				Game.count({ "teams": { $elemMatch: { "team": team._id}}, finished: { $ne: null }}, function(err) {
					if  (err) {
						console.log(err);
						res.status(500).json({ status : err});
					}
				}).then( function (played_games) {
					team.won_games = won_games;
					team.played_games = played_games;
					if (played_games == 0) team.win_percent = null;
					else team.win_percent = won_games / played_games * 100;
					res.json(team);
				});
			});
		}
	});
});

router.delete('/:team_name', function(req, res) {
	Team.findOne({ team_name: req.params.team_name }, function (err) {
		if  (err) {
			console.log(err);
			res.status(500).json({ status : err});
		}
	}).then( function (team) {
		console.log(team);
		if ( team === null ) {
				res.status(500).json({ status : "Error, team " + req.params.team_name + " is not found" });
		} else {
			Game.findOne({ "teams.team": team._id}, function(err) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
			}).then( function (games) {
				if (games === null) {
					team.remove( function (err) {
						if  (err) {
							console.log(err);
							res.status(500).json({ status : err});
						} else {
							res.json({ status : 'OK, team deleted' });
						}
					})
				} else {
					res.status(500).json({ status : "Error, games are associated with " + req.params.team_name });
				}
			})
		}
	})
});

var team_schema = Joi.object ({
	team_name: Joi.string().alphanum().min(1).required(),
	players: Joi.array().items(Joi.object( { name : Joi.string().alphanum().required(),}), Joi.object( { name : Joi.string().alphanum().required(),})).required()
});

router.post('/newteam', function(req, res) {
	var teamDetails = req.body;
	Joi.validate( teamDetails, team_schema, function (err, validTeam) {
		if (err) {
			console.log(err);
			res.status(500).json({ status : err });
		}
		else {
			var newTeam = Team(validTeam);
			newTeam.save( function(err) {
				if  (err) {
					console.log(err);
					res.status(500).json({ status : err});
				}
				else {
					res.json({ status : 'OK, team added' });
				}
			});
		}	
	});
});

router.get('/:team_name/most_picked', function(req, res) {
	console.log(
		Game.aggregate( { $group: { _id: "$teams.team.pick1"}, count: { $sum: 1} })
		.exec( function(err) {
			return err;
		})
	)

})

module.exports = router;