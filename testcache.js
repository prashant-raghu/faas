var request = require('request');

function get(){
    request.post('http://54.81.215.99:8090/getCache', {
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
    request.post('http://54.81.215.99:8090/setCache', {
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

// set("Result has been set");
get();