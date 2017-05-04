var m4n = require('maps4news');

var clientId = 1; // client id
var secret = ''; // Secret https://www.youtube.com/watch?v=zwZISypgA9M
var username = 'user@example.com'; // email is used for authentication
var password = 'Password1!'; // password

// Secret will be leaked if this is used on a webpage. Please only use
// this for non-web applications.
var auth = new m4n.PasswordFlow(clientId, secret, username, password);
var api = new m4n.Maps4News(auth);

// This will resolve with the calling instance of the api for easy chaining
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});
