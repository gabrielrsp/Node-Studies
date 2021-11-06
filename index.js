//console.log("Hello World")
//Node read this file, 
//Send the commands down to V8
//V8 processed it 
//The console ended up locking out the message
//Theres nothing else for node event loop to do, so it exited

/*
Primary file for the API
*/

//Dependencies

/*
Node Built In module Http Server, that let you listen on ports and respond with a Data
*/
var http = require('http');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;

// The server should respond to all requests with a string
var server = http.createServer(function (req, res) { //every time localhost is called, this function is called and req,res are brand new

  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true); //parsedUrl will receive an object with a bunch of keys about the request made

  // Get the path 
  var path = parsedUrl.pathname
  var trimmedPath = path.replace(/^\/+|\/+$/g, ''); //Trimmin of slashes from the path to clean the url

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  var method = req.method


  //Get the payload, if any
  var decoder = new StringDecoder('utf-8');
  var buffer = '';

  req.on('data', function (data) { //If there's no payload, it never gets called
    buffer += decoder.write(data)  //appending the request data payload that comes in chunks of bits and are converted into string
  })

  // Get the headers as an object
  var headers = req.headers;
  // console.log('Request received with these headers: ', headers)

  console.log("Request received with this payload: ", buffer)


  req.on('end', function () {  //always get called
    buffer += decoder.end();

    // Choose the handler this request should go to. If one is not found, use the notFoundhandler
    var chosenHandler = typeof (router[trimmedPath]) !== 'undefined' ? router[trimmedPath] : handlers.notFound

    // Construct the data object to send to the handler
    var data = {
      'trimmedPath': trimmedPath,
      'queryStringObject': queryStringObject,
      'method': method,
      'headers': headers,
      'payload': buffer
    }

    //Route the request to the handler specified in the router
    chosenHandler(data, function(statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof(statusCode) === 'number' ? statusCode : 200

      // Use the payload callback by the handler or default to empty object
      payload = typeof(payload) === 'object' ? payload : {}


      // Convert the payload to a string
      var payloadString = JSON.stringify(payload); // payload that is sent back to the user

      //Return the response
      res.setHeader('Content-Type', 'application/json') // formalizes that we are sending json to the user!
      res.writeHead(statusCode) //built-in method to write the status code
      res.end(payloadString)


      console.log("Returning this response: ", statusCode, payloadString)

    })

    //here the request is finished (there's no more chunks of bits left to convert)    

  })

  // Log the request path
  //console.log('Request received on path: ', trimmedPath + ' with this method: ' + method +' with these query string parameters: ', queryStringObject)

})


// Start the server and have it listen on port 3000
server.listen(3000, function () {
  console.log("The server is listening on port 3000 now")
})

// Curl (“Client URL”) comando usado como abreviação para verificar a conectividade da URL, 
//curl localhost:3000


// Define the handlers
var handlers = {}

// Sample handler
handlers.sample = function (data, callback) {
  // Callback a HTTP status code and payload object
  callback(406, { 'name': 'sample handler' })
}

handlers.notFound = function (data, callback) {
  callback(404)
}

// Define a request router
var router = {
  'sample': handlers.sample
}