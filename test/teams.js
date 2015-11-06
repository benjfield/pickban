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
	"player_1" : "test1",
	"player_2" : "test2"
};

describe('POST /teams/newteam', function(){
  it('respond with json', function(done){
    request('http://localhost:3000')
      .put('/teams/teamlist')
      .send(testTeam)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done();
      });
  });
});
