const spawn = require('child_process').spawn;
var exec = require('child_process').exec;
const fs = require('fs');
var PROTO_PATH = __dirname + '/static/faas.proto';
var grpc = require('grpc');
var protoLoader = require('@grpc/proto-loader');
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

const package = `{
    "name": "faas",
    "version": "1.0.0",
    "scripts": {
      "start": "node index.js"
    },
    "dependencies": {
    }
}`
function node_mod() {
    fs.writeFile(__dirname + "/static/package.json", package, function (err) {
        if (err) {
            return console.log(err);
        }
        console.log("The file was saved!");
    });
    exec('cd ./static ; npm i express', function (err, stdout, stderr) {
        console.log('Done: installed node modules')
    })
}
function start() {
    var child = spawn(process.execPath, ['static/sample.js', 'massage'])
    setTimeout(() => {
        child.kill('SIGINT')
    }, 1000)
    child.stdout.on('data', function (data) {
        console.log('from child: ', data.toString())
    })
    child.on('exit', function (code, signal) {
        if (code != 0)
            console.log('child process exited with ' + `code ${code} and signal ${signal}`)
    });
}
function extractRequire(code) {
    var codeSplit = code.replace(/\n/g, " ").split(" ")
    var res = [];
    for (let snip of codeSplit) {
        if (snip.match(/'([^']+)'/) && snip.startsWith("require")) {
            res.push(snip.match(/'([^']+)'/)[1])
            console.log(snip.match(/'([^']+)'/)[1])
        }
        if (snip.match(/"([^"]+)"/) && snip.startsWith("require")) {
            res.push(snip.match(/"([^"]+)"/)[1])
            console.log(snip.match(/"([^"]+)"/)[1])
        }
    }
    return res;
}
function fCreate(call, callback) {
    //will be called at function create time
    try {
        var dir = __dirname + `/functions/${call.request.userId}`
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        dir = __dirname + `/functions/${call.request.userId}/${call.request.fName}`
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir);
        fs.writeFile(dir + `/package.json`, package, function (err) {
            if (err) {
                return console.log(err);
            }
            console.log("Package.json saved!");
        });
        var dependencies = "";
        for (let dep of extractRequire(call.request.code)) {
            dependencies += dep + ' ';
        }

        exec(`cd ./functions/${call.request.userId}/${call.request.fName}; npm i ${dependencies}`, function (err, stdout, stderr) {
            console.log(stdout, 'Done: installed node modules');
            fs.writeFile(dir + `/index.js`, call.request.code, function (err) {
                if (err) {
                    return console.log(err);
                }
                console.log("Code saved!");
            });
            callback(null, { status: 'Success' });
        })
    }
    catch (err) {
        console.log(err)
        callback(null, { status: 'Failed' });
    }
}


function fCall(call, callback) {
    //will be called and expected to return the stdout of that function
    try {
        var dir = __dirname + `/functions/${call.request.userId}/${call.request.fName}/index.js`
        var child = spawn(process.execPath, [dir, ...call.request.param])
        setTimeout(() => {
            child.kill('SIGINT')
        }, 1000)
        child.stdout.on('data', function (data) {
            console.log('from child: ', data.toString())
            callback(null, { status: 'Success', result: data.toString() });
        })
        child.on('exit', function (code, signal) {
            if (code != 0) {
                console.log('child process exited with ' + `code ${code} and signal ${signal}`)
                callback(null, { status: 'Failed', result: "" });
            }
        });
    }
    catch (err) {
        callback(null, { status: 'Failed', result: "" });
    }
}

function fDelete(call, callback) {
    try {
        var dir = __dirname + `/functions/${call.request.userId}/${call.request.fName}`
        exec(`rm -rf ${dir}`, function (err, stdout, stderr) {
            console.log(stdout, 'Done: Deleted '+ dir);
            callback(null, { status: 'Success' });
        })
    }
    catch (err) {
        callback(null, { status: 'Failed'});
    }

}


function main() {
    var server = new grpc.Server();
    server.addService(faas_proto.Faas.service, { fCreate: fCreate, fCall: fCall, fDelete: fDelete });
    server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
    server.start();
}

main();
