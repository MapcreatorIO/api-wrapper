// Obtained client id
var clientId = 1;

// Redirect url is set to the current url by default. The
// script is smart enough close the page if it detects that
// it's a child after authentication. This means that either
// the current page can be set as the callback (default) or
// a custom page that just contains `api.authenticate()`.
var auth = new maps4news.ImplicitFlowPopup(clientId);
var api = new maps4news.Maps4News(auth);

// This will hijack the page if no authentication cache can
// be found. Smartest thing to do is to just let it happen
// and initialize any other code afterwards.
api.authenticate().then(function() {
  // Get the current user and dump the result to the console.
  api.users.get('me').then(console.dir);
});
