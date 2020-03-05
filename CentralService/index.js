
var PROTO_PATH = __dirname + '/../static/faas.proto';

const express = require('express')
const app = express()
const port = 3000
var request = require('request');
var cors = require('cors')
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var bodyParser = require('body-parser')

app.use(cors())
app.use(bodyParser.urlencoded({ extended: false }))

var packageDefinition = protoLoader.loadSync(
  PROTO_PATH,
  {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  });
var faas_proto = grpc.loadPackageDefinition(packageDefinition).faas;
var auth = 'http://54.81.215.99:8080/'
var cache = 'http://54.81.215.99:8090/'
function main() {
  var client = new faas_proto.Faas('localhost:50051',
    grpc.credentials.createInsecure());

  app.get('/', (req, res) => res.send('Central Service for faas!'))
  app.post('/function/create', (req, res) => {
    var fName = req.body.fName;
    var code = req.body.code;
    var token = req.body.token;
    request.get({
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer ' + token
      },
      url: `${auth}auth/status`,
    }, function (error, response, body) {
      console.log(body);
      body = JSON.parse(body);
      client.fCreate({ userId: body.data.user_id, fName: req.body.fName, code: req.body.code }, function (err, response) {
        console.log('Server response: ', response);
        res.send(response);
      })
    });
  })
  app.post('/function/delete', (req, res) => {
    var fName = req.body.fName;
    var token = req.body.token;
    request.get({
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer ' + token
      },
      url: `${auth}auth/status`,
    }, function (error, response, body) {
      console.log(body);
      body = JSON.parse(body);
      client.fDelete({ userId: body.data.user_id, fName: req.body.fName }, function (err, response) {
        console.log('Server response: ', response);
        res.send(response);
      })
    });
  })
  app.post('/function/call', (req, res) => {
    var fName = req.body.fName;
    //from cache
    request.post(cache + 'getCache', {
      json: {
        user_id: req.body.userid,
        fName: req.body.fName,
      }
    }, (error, res, body) => {
      if (error) {
        res.send(error);
      }
      else if (body != "Failed") {
        res.send(body);
      }
      else {
        client.fCall({ userId: req.body.userid, fName: req.body.fName, param: req.body.param }, function (err, response) {
          console.log('Server response: ', response);
          request.post(cache + 'setCache', {
            json: {
              user_id: req.body.userid,
              fName: req.body.fName,
              fRes: response
            }
          }, (error, res, body) => {
            if (error) {
              res.send(error)
            }
          })
          res.send(response);
        })
      }
      console.log(body)
    })
  })
  app.post('/function/show', (req, res) => {
    console.log(req.body)
    var token = req.body.token;
    request.get({
      headers: {
        'content-type': 'application/x-www-form-urlencoded',
        'Authorization': 'bearer ' + token
      },
      url: `${auth}auth/status`,
    }, function (error, response, body) {
      console.log(body);
      body = JSON.parse(body);
      client.fshow({ userId: body.data.user_id }, function (err, response) {
        console.log('Server response: ', response);
        res.send(response);
      })
    });
  })


  app.listen(port, () => console.log(`Central Service for faas app listening on port ${port}!`))
}

main();
module.exports = app


  // gRPC Calls Backup
  // client.fCreate({userId: 'uidxxxx', fName: 'init', code: code}, function(err, response){
  //   console.log('Server response: ', response);
  // })
  // client.fDelete({userId: 'uidxxxx', fName: 'init'}, function(err, response){
  //   console.log('Server response: ', response);
  // })
  // client.fCall({userId: 'uidxxxx', fName: 'init', param: ["p1","p2","p3"]}, function(err, response){
  //   console.log('Server response: ', response);
  // })