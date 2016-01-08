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
