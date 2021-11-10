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
var https = require('https');
var url = require('url');
var StringDecoder = require('string_decoder').StringDecoder;
var config = require('./lib/config')
var fs = require('fs');
var handlers = require('./lib/handlers')
var helpers = require('./lib/helpers')

//var _data = require('./lib/data');

// TESTING
// @TODO delete this

// _data.create('test', 'newFile', {'foo': 'bar'}, function(err) {
//   console.log('this was the error', err)
// })

// _data.read('test', 'newFile', function(err,data) {
//   console.log('this was the error', err, 'and this was the data, ', data);
// })

// _data.update('test', 'newFile', {'fizz': 'buzz'}, function(err) {
//   console.log('this was the error', err);
// })

// _data.delete('test', 'newFile', function(err) {
//   console.log('this was the error', err);
// })


// Instantiate the HTTP Server
var httpServer = http.createServer(function (req, res) { //every time localhost is called, this function is called and req,res are brand new
  unifiedServer(req, res)
  // Log the request path
  //console.log('Request received on path: ', trimmedPath + ' with this method: ' + method +' with these query string parameters: ', queryStringObject)

})

// Start the  HTTP Server
httpServer.listen(config.httpPort, function () {
  console.log("The server is listening on port " + config.httpPort)
})


// Instantiate the HTTPS Server
var httpsServerOptions = {
  'key': fs.readFileSync('./https/key.pem'),  //for synchronous read
  'cert': fs.readFileSync('./https/cert.pe')
}

var httpsServer = https.createServer(httpsServerOptions, function (req, res) { //every time localhost is called, this function is called and req,res are brand new
  unifiedServer(req, res)
  // Log the request path
  //console.log('Request received on path: ', trimmedPath + ' with this method: ' + method +' with these query string parameters: ', queryStringObject)

})

// Start the HTTPS Server
httpsServer.listen(config.httpsPort, function () {
  console.log("The server is listening on port " + config.httpsPort)
})


// Curl (“Client URL”) comando usado como abreviação para verificar a conectividade da URL, 
//curl localhost:3000

// All the server logic for both the http and https server
var unifiedServer = function (req, res) {

  // Get the URL and parse it
  var parsedUrl = url.parse(req.url, true); //parsedUrl will receive an object with a bunch of keys about the request made

  // Get the path 
  var path = parsedUrl.pathname
  var trimmedPath = path.replace(/^\/+|\/+$/g, ''); //Trimmin of slashes from the path to clean the url

  // Get the query string as an object
  var queryStringObject = parsedUrl.query;

  // Get the HTTP Method
  var method = req.method.toLowerCase()

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
      'payload': helpers.parseJsonToObject(buffer)
    }

    //Route the request to the handler specified in the router
    chosenHandler(data, function (statusCode, payload) {
      // Use the status code called back by the handler, or default to 200
      statusCode = typeof (statusCode) === 'number' ? statusCode : 200

      // Use the payload callback by the handler or default to empty object
      payload = typeof (payload) === 'object' ? payload : {}


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

}


// Define a request router
var router = {
  'ping': handlers.ping,
  'users': handlers.users,
  'tokens': handlers.tokens,
  'checks': handlers.checks
}



