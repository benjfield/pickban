var express = require('express');
var router = express.Router();
var Team = require('../lib/team');
var Joi = require('joi');

// var lib = require('./lib/')
/*
 * GET teamlist.
 */
router.get('/teamlist', function(req, res) {
	Team.find({}, function(err, teams) {
		if  (err !== null) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json(teams);
		}
	});
});

router.get('/:team_name', function(req, res) {
	Team.find({ team_name: req.params.team_name }, function(err, team) {
		if  (err !== null) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json(team);
		}
	});
});

router.delete('/:team_name/delete', function(req, res) {
	console.log(help);
	Team.findOneAndRemove({ team_name: req.params.team_name }, function(err, team) {
		if  (err !== null) {
			console.log(err);
			res.status(500).json({ status : err});
		}
		else {
			res.json({ status : 'OK, team deleted' });
		}
	});
});

var team_schema = Joi.object ({
	team_name: Joi.string().alphanum().required(),
	players: Joi.array().items(Joi.object( { name : Joi.string().alphanum().required(),}), Joi.object( { name : Joi.string().alphanum().required(),})).required()
});

router.post('/newteam', function(req, res) {
	var teamDetails = req.body;
	Joi.validate( teamDetails, team_schema, function (err, validTeam) {
		if (err !== null ) {
			console.log(err);
			res.status(500).json({ status : err });
		}
		else {
			var newTeam = Team(validTeam);
			newTeam.save( function(err) {
				if  (err !== null) {
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

module.exports = router;