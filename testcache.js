var request = require('request');

function get(){
    request.post('http://127.0.0.1:8090/getCache', {
        json: {
            user_id: "4",
            fName: "functionName2",
        }
    }, (error, res, body) => {
        if (error) {
            console.error(error)
            return
        }
        console.log(body)
    })
}
function set(result) {
    request.post('http://127.0.0.1:8090/setCache', {
        json: {
            user_id: "4",
            fName: "functionName2",
            fRes: result
        }
      }, (error, res, body) => {
        if (error) {
          console.error(error)
          return
        }
        console.log(body)
      })
}

set("Result has not been set");
get();