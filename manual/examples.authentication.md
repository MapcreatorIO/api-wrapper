# Authentication
Authentication is done through [OAuth]. This library provides multiple [OAuth flow]
implementations for authentication. A client id can be obtained through a support
ticket but this is planned to change in the near future. The client will first
check if any tokens can be found in the cache before requiring authentication.
If one can be found the `api.authenticate()` method will instantly resolve without 
any side-effects. The variable `api.authenticated` will be set to true if a token
has been found and is still valid. 

Tokens are stored in HTTPs cookies if possible and using `localStorage` when the
browser is not using a HTTPs connection. No storage mechanism has been implemented
for [nodejs] applications yet.

## Web
Multiple flows are supported for web browsers. All the web examples assume the web
build of the library has been included in the target page.

### Implicit Flow
A client id is required to use the implicit flow. The redirect url *must* be the 
same as the one linked to the client id. The callback url is automatically 
guessed if none is provided.

```js
// Obtained client id
var clientId = 1;

// Callback url is set to the current url by default
var auth = new maps4news.ImplicitFlow(clientId);
var api = new maps4news.Maps4News(auth);

// This will hijack the page if no authentication cache can
// be found. Smartest thing to do is to just let it happen
// and initialize any other code afterwards.
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});
```

### Implicit flow pop-up
Just like the Implicit Flow a client id is required. 

```js
// Obtained client id
var clientId = 1;

// Callback url is set to the current url by default. The
// script is smart enough close the page if it detects that
// it's a child after authentication. This means that either
// the current page can be set as the callback (default) or
// a custom page that just contains `api.authenticate()`
// that uses ImplicitFlowPopup as the auth parameter.
var auth = new maps4news.ImplicitFlowPopup(clientId);
var api = new maps4news.Maps4News(auth);

// This will create a pop-up window containing the log in
// page. Once the pop-up redirects back to the callback it
// will resolve the promise. The callback page should contain
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});
```
### Implicit flow pop-up (advanced)
Due to the nature of the implicit flow pop-up (referred to as IFP from now on)
method the callback page can be set to a blank page that just grabs the token 
and then closes. This can be done in the following way.

**index.html:**
```js
var clientId = 1;
var callbackUrl = 'https://example.com/callback.html';

var auth = new maps4news.ImplicitFlowPopup(clientId);
var api = new maps4news.Maps4News(auth);

// This will resolve once the callback page has been loaded
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});
```

**callback.html:**
```js
var clientId = 1;

// This will instantly detect the token and close the page
new maps4news.ImplicitFlowPopup(clientId);
```

### Password flow (dangerous)
The password flow is **NOT** intended to be used in the browser. If you do 
decide to use the password flow then it is recommended to make sure that 
the site is **NOT** public facing and using HTTPs. Leaking the [secret] is
a very bad idea.

```js
var clientId = 1; // client id
var secret = ''; // secret
var username = 'user@example.com'; // email is used for authentication
var password = 'Password1!'; // password

// Secret will be leaked if this is used on a webpage. Please only use
// this for non-web applications.
var auth = new maps4news.PasswordFlow(clientId, secret, username, password);
var api = new maps4news.Maps4News(auth);

// This will resolve once the authentication has completed
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});

```

### Dummy flow
The dummy flow can be used when a token *should* be present in the cache. 

```js
var auth = new maps4news.DummyFlow();
var api = new maps4news.Maps4News(auth);

// Manually check if we're logged in
if (api.authenticated) {
    console.log('Found authentication token in cache!');
}

api.authenticate().then(function() {
    // Will only resolve if a token was found
    console.log("We're authenticated");
}).catch(function(err) {
    // This will be called if `api.authenticated` is false
    console.log(err.toString());
});
```

## Nodejs
The library currently only supports the password flow and the dummy flow
for [nodejs]. Other flows might be added in the future.

### Password Flow
Make sure to store your [secret] somewhere safe and to only store the token
and **never** the unencrypted user password.

```js
var clientId = 1; // client id
var secret = ''; // secret
var username = 'user@example.com'; // email is used for authentication
var password = 'Password1!'; // password

var auth = new maps4news.PasswordFlow(clientId, secret, username, password);
var api = new maps4news.Maps4News(auth);

// This will resolve once the authentication has completed
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});

```

### Dummy flow
The dummy flow can also be used when a token is known.

```js
var auth = new maps4news.DummyFlow();
var api = new maps4news.Maps4News(auth);

var token = {
  token: "eyJ0eXAiOiJKV1...",
  type: "Bearer",
  expires: "Thu, 18 May 2017 14:14:38 GMT"
};

// Set the token
api.auth.token = maps4news.OAuthToken.fromResponseObject(token);

// Manually check if we're logged in
if (api.authenticated) {
    console.log('Found authentication token in cache!');
}

api.authenticate().then(function() {
    // Will only resolve if a token was found
    console.log("We're authenticated");
}).catch(function(err) {
    // This will be called if `api.authenticated` is false
    console.log(err.toString());
});
```

[OAuth flow]: https://aaronparecki.com/oauth-2-simplified/#authorization
[OAuth]: https://oauth.org
[nodejs]: https://nodejs.org
[secret]: https://www.youtube.com/watch?v=zwZISypgA9M