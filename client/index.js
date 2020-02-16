
var PROTO_PATH = __dirname + '/../static/faas.proto';

var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
var packageDefinition = protoLoader.loadSync(
    PROTO_PATH,
    {keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
    });
var faas_proto = grpc.loadPackageDefinition(packageDefinition).faas;

function main() {
  var client = new faas_proto.Faas('localhost:50051',
                                       grpc.credentials.createInsecure());
                                      
  var code = `
  var express = require('express')

  console.log("I am running from sample!!")
  // while(true){}`
  // client.fCreate({userId: 'uidxxxx', fName: 'init', code: code}, function(err, response){
  //   console.log('Server response: ', response);
  // })
  client.fCall({userId: 'uidxxxx', fName: 'init', param: ["p1","p2","p3"]}, function(err, response){
    console.log('Server response: ', response);
  })
}

main();
