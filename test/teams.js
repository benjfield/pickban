var request = require('supertest'), 
should = require('should');

describe('GET /teams/teamlist', function(){
  it('respond with json', function(done){
    request('http://localhost:3000')
      .get('/teams/teamlist')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done();
      });
  });
});

var testTeam = {
	"team_name" : "testTeam",
	"players" : [ 
		{ "name" : "test1" },
		{ "name" : "test2" }
	]
};

describe('POST /teams/newteam GET /teams/testTeam DELETE /teams/testTeam/delete', function(){
  	it('accepts post and responds with json', function(done){
    	request('http://localhost:3000')
      		.post('/teams/newteam')
      		.type('json')
      		.send(testTeam)
      		.set('Accept', 'application/json')
      		.expect(200)
      		.end(function(err, res){
        		if (err) return done(err);
        		done();
      		});
	});

	it('returns correct team', function(done){
    	request('http://localhost:3000')
      		.get('/teams/testTeam,')
      		.type('json')
      		.send(testTeam)
      		.set('Accept', 'application/json')
      		.expect(200, { team_name : "teamTest", "players" : [ 
				{ "name" : "test1" },
				{ "name" : "test2" }
			]})
      		.end(function(err, res){
        		if (err) return done(err);
        		done();
      		});
  	});

  	it('deletes team', function(done){
    	request('http://localhost:3000')
      		.delete('/teams/testTeam/delete,')
      		.type('json')
      		.send(testTeam)
      		.set('Accept', 'application/json')
      		.expect(200)
      		.end(function(err, res){
        		if (err) return done(err);
        		done();
      		});
  	});

  	it('team is deleted', function(done){
    	request('http://localhost:3000')
      		.delete('/teams/testTeam,')
      		.type('json')
      		.send(testTeam)
      		.set('Accept', 'application/json')
      		.expect(500)
      		.end(function(err, res){
        		if (err) return done(err);
        		done();
      		});
  	});
});


