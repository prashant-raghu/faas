var request = require('supertest');
var app = require('../index.js');
describe('GET /', function() {
 it('respond with Central Service', function(done) {
  //navigate to root and check the response is "Central Service for faas!"
  request(app).get('/').expect('Central Service for faas!', done);
 });
});