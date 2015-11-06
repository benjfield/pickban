var express = require('express');
var router = express.Router();
// var lib = require('./lib/')
/*
 * GET teamlist.
 */
router.get('/teamlist', function(req, res) {
    var db = req.db;
    var collection = db.get('teamlist');
    collection.find({},{},function(e,docs){
        res.json(docs);
    });
});

router.post('/newteam', function(req, res) {
	var db = req.db;
	var collection = db.get('teamlist');
	collection.insert(req.body, function(err, result){
		if  (err != null) {
			res.json({ status : 'ok'});
		}
		else {
			res.status(500).json({ status : err});
		}	
	});
});

module.exports = router;