var request = require('supertest'), 
express = require('express');

var app = express()

describe('GET /teams/teamlist', function(){
  it('respond with json', function(done){
    request(app)
      .get('/teams/teamlist')
      .set('Accept', 'application/json')
      .expect(200)
      .end(function(err, res){
        if (err) return done(err);
        done();
      });
  });
});