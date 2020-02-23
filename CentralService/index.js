
var PROTO_PATH = __dirname + '/../static/faas.proto';

const express = require('express')
const app = express()
const port = 3000
var request = require('request');
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var bodyParser = require('body-parser')

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
function main() {
  var client = new faas_proto.Faas('localhost:50051',
    grpc.credentials.createInsecure());

  var code = `
  var express = require('express') 
  var express2 = require('grpc')
  var express3 = require("lodash")
  console.log('I am running from sample!!')
  // while(true){}`

  // client.fCreate({userId: 'uidxxxx', fName: 'init', code: code}, function(err, response){
  //   console.log('Server response: ', response);
  // })
  // client.fDelete({userId: 'uidxxxx', fName: 'init'}, function(err, response){
  //   console.log('Server response: ', response);
  // })
  // client.fCall({userId: 'uidxxxx', fName: 'init', param: ["p1","p2","p3"]}, function(err, response){
  //   console.log('Server response: ', response);
  // })

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
    client.fCall({ userId: req.body.userid, fName: req.body.fName, param: req.body.param }, function (err, response) {
      console.log('Server response: ', response);
      res.send(response);
    })
  })
  app.post('/function/show', (req, res) => {
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
      client.fshow({ userId: body.data.user_id}, function (err, response) {
        console.log('Server response: ', response);
        res.send(response);
      })
    });
  })
  

  app.listen(port, () => console.log(`Central Service for faas app listening on port ${port}!`))
}

main();
