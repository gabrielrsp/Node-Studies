/*
Helpers for various tasks
*/

// Dependencies
var crypto = require('crypto')
var config = require('./config')

// Container for all the helpers
var helpers = {}


// Create a SHA256 hash
helpers.hash = function (str) {
  if (typeof (str) == 'string' && str.length > 0) {
    var hash = crypto.createHmac('sha256', config.hashingSecret).update(str).digest('hex');
    return hash;

  } else {
    return false
  }
}

// Parse a JSON string to an object in all cases, without throwing  
helpers.parseJsonToObject = function (str) {
  try {
    var obj = JSON.parse(str)
    return obj
  } catch (e) {
    return {}
  }
}

helpers.createRandomString = function (strLength) {
  strLength = typeof(strLength) == 'number' && strLength > 0 ? strLength : false

  if(strLength) {
    // Define all the possible charcters that could go into a string 
    var possibleCharacters = 'abcdefghijklmnopqrstuvwyxz0123456789'

    // Start the final string
    var str = '';
    let i
    for(i = 0; i < strLength; i++){
      // Get a random character from the possibleCharacters string
      var randomCharacter = possibleCharacters.charAt(Math.floor(Math.random() * possibleCharacters.length))
      // Append this character to the final string
      str += randomCharacter
    }

    return str
  }
}

module.exports = helpers