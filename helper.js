const spawn = require('child_process').spawn;
var exec = require('child_process').exec;
const fs = require('fs');

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