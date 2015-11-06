var express = require('express');
var router = express.Router();

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

module.exports = router;