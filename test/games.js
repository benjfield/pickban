var request = require('supertest'), 
should = require('should');

describe('GET /games/gamelist', function(){
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

describe('Game creation tests', function(){

  var testTeam1 = {
    "team_name" : "testTeam1",
    "players" : [ 
      { "name" : "test1" },
      { "name" : "test2" }
    ]
  };

  var testTeam2 = {
    "team_name" : "testTeam2",
    "players" : [ 
      { "name" : "test1" },
      { "name" : "test2" }
    ]
  };

  before(function(){
    request('http://localhost:3000')
      .post('/teams/newteam')
      .type('json')
      .send(testTeam1)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) console.log(err);
      });

    request('http://localhost:3000')
      .post('/teams/newteam')
      .type('json')
      .send(testTeam2)
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) console.log(err);
      });
  });

  after(function(){
    request('http://localhost:3000')
      .delete('/teams/testTeam1')
      .type('json')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) console.log(err);
      });

    request('http://localhost:3000')
      .delete('/teams/testTeam2')
      .type('json')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) console.log(err);
      });
  });

  var goodGame = {
    "teams": [{
      "team": "testTeam1",
      "radiant": true,
      "first_pick": false
    },
    {
      "team": "testTeam2",
      "radiant": false,
      "first_pick": true
    }]
  };

  var badGame = {
    "teams": [{
      "team": "testTeam1",
      "radiant": true,
      "first_pick": false
    },
    {
      "team": "testTeam3",
      "radiant": true,
      "first_pick": true
    }]
  };

  describe('POST /games/newgame', function(){
    it('accepts the good game and responds with json', function(done){
      request('http://localhost:3000')
        .post('/games/newgame')
        .type('json')
        .send(goodGame)
        .set('Accept', 'application/json')
        .expect(200)
        .end(function(err, res){
          if (err) {
            console.log(err);
            return done(err);
          }
          done();
        });
    });
  });
})