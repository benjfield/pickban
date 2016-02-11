var express = require('express');
var router = express.Router();
var Game = require('../lib/game');
var Team = require('../lib/team');
var Joi = require('joi');

function get_team_from_name(team_name) {
	return Team.findOne({ "team_name": team_name })
	.lean()
	.exec();
}

function most_picked_heroes(team_id) {
	if (team_id == "all") {
		return Game.aggregate( [
			{ $match: { "finished": { $ne: null } } },
			{ $unwind: "$teams" },
			{ $unwind: "$teams.picks" },
			{ $group: { 
				"_id": "$teams.picks", 
				"count": { $sum: 1} } },
			{ $sort: { "count": -1 } },
			{ $limit: 3}
		]).exec();
	}
	return Game.aggregate( [
		{ $match: { "finished": { $ne: null } } },
		{ $unwind: "$teams" },
		{ $match: { "teams.team": team_id } },
		{ $unwind: "$teams.picks" },
		{ $group: { 
			"_id": "$teams.picks", 
			"count": { $sum: 1} } },
		{ $sort: { "count": -1 } },
		{ $limit: 3}
	]).exec();
}

function most_banned_heroes(team_id) {
	if (team_id == "all") {
		return Game.aggregate( [
			{ $match: { "finished": { $ne: null } } },
			{ $unwind: "$teams" },
			{ $unwind: "$teams.bans" },
			{ $group: { 
				"_id": "$teams.bans", 
				"count": { $sum: 1} } },
			{ $sort: { "count": -1 } },
			{ $limit: 3}
		]).exec();
	}
	return Game.aggregate( [
		{ $match: { "finished": { $ne: null } } },
		{ $unwind: "$teams" },
		{ $match: { "teams.team": team_id } },
		{ $unwind: "$teams.bans" },
		{ $group: { 
			"_id": "$teams.bans", 
			"count": { $sum: 1} } },
		{ $sort: { "count": -1 } },
		{ $limit: 3}
	]).exec();
}

function most_successful_heroes(team_id) {
	if (team_id == "all") {
		return Game.aggregate( [
			{ $match: { "finished": { $ne: null } } },
			{ $unwind: "$teams" },
			{ $unwind: "$teams.picks" },
			{ $project: 
				{ "teams.picks": 1 ,
				"winner_number": { $cond: { if: "$teams.winner", then: 100, else: 0 } } }
				},
			{ $group: { 
				"_id": "$teams.picks", 
				"percentage": { $avg: "$winner_number"} } },
			{ $sort: { "percentage": -1 } }, 
			{ $limit: 3} 
		]).exec();
	}
	return Game.aggregate( [
		{ $match: { "finished": { $ne: null } } },
		{ $unwind: "$teams" },
		{ $match: { $and: [ { "teams.team": team_id }] } },
		{ $unwind: "$teams.picks" },
		{ $project: 
			{ "teams.picks": 1 ,
			"winner_number": { $cond: { if: "$teams.winner", then: 100, else: 0 } } }
			},
		{ $group: { 
			"_id": "$teams.picks", 
			"percentage": { $avg: "$winner_number"} } },
		{ $sort: { "percentage": -1 } }, 
		{ $limit: 3} 
	]).exec();
}

function won_games(team_id) {
	return Game.count({ "teams": 
		{ $elemMatch: 
			{ "team": team_id, "winner": true}
		}, 
		finished: { $ne: null }
	})
	.exec();
}

function played_games(team_id) {
	return Game.count({ "teams": 
		{ $elemMatch: 
			{ "team": team_id }
		}, 
		finished: { $ne: null }
	})
	.exec();
}

router.get('/teamlist', function(req, res) {
	Team.find({})
	.exec()
	.then( function(teams) {
		res.json(teams);
	}, function(err) {
		console.log(err);
		return res.status(500).json({ status : err});
	});
});

router.get('/most_picked_heroes', function(req, res) {
	console.log("here")
	most_picked_heroes("all")
	.then( function(result) {
		res.json({ "most_picked_heroes" : result });
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})

router.get('/most_banned_heroes', function(req, res) {
	console.log("here")
	most_banned_heroes("all")
	.then( function(result) {
		res.json({ "most_banned_heroes" : result });
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})

router.get('/most_successful_heroes', function(req, res) {
	console.log("here")
	most_successful_heroes("all")
	.then( function(result) {
		res.json({ "most_successful_heroes" : result });
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})

router.get('/:team_name', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		if ( team === null ) {
			res.status(500).json({ status : "Error, team " + req.params.team_name + " is not found" });
		}
		else {
			Promise.all([played_games(team._id), won_games(team._id), most_picked_heroes(team._id), most_banned_heroes(team._id), most_successful_heroes(team._id) ])
			.then( function(results) {
				team.played_games = results[0];
				team.won_games = results[1];
				if (results[0] == 0) team.win_percent = null;
				else team.win_percent = results[1] / results[0] * 100;
				team.most_picked_heroes = results[2];
				team.most_banned_heroes = results[3];
				team.most_successful_heroes = results[4];
				res.json(team);
			}, function (err) {
				console.log(err);
				res.status(500).json({ status : err});
			});
		}
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
});

router.delete('/:team_name', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function (team) {
		if ( team === null ) {
				res.status(500).json({ status : "Error, team " + req.params.team_name + " is not found" });
		} else {
			Game.findOne({ "teams.team": team._id})
			.exec( function(err) {
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
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
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

router.get('/:team_name/test', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		most_successful_heroes(team._id)
		.then( function(results) {
			console.log(results);
			res.json({ "most_successful" : results });
		})
	});
})

router.get('/:team_name/stats', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		Promise.all([played_games(team._id), won_games(team._id) ])
		.then ( function(results) {
			var stats = {};
			stats.played_games = results[0];
			stats.won_games = results[1];
			if (results[0] == 0) stats.win_percent = null;
			else stats.win_percent = results[1] / results[0] * 100;
			res.json(stats);
		}, function (err) {
			console.log(err);
			res.status(500).json({ status : err});
		});
	});
})

router.get('/:team_name/most_picked_heroes', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		most_picked_heroes(team._id)
		.then( function(result) {
			res.json({ "most_picked_heroes" : result });
		}, function(err) {
			console.log(err);
			res.status(500).json({ status : err});
		});
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})

router.get('/:team_name/most_banned_heroes', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		most_banned_heroes(team._id)
		.then( function(result) {
			res.json({ "most_banned_heroes" : result });
		}, function(err) {
			console.log(err);
			res.status(500).json({ status : err});
		});
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})

router.get('/:team_name/most_successful_heroes', function(req, res) {
	get_team_from_name(req.params.team_name)
	.then( function(team) {
		most_successful_heroes(team._id)
		.then( function(result) {
			res.json({ "most_successful_heroes" : result });
		}, function(err) {
			console.log(err);
			res.status(500).json({ status : err});
		});
	}, function(err) {
		console.log(err);
		res.status(500).json({ status : err});
	});
})


module.exports = router;