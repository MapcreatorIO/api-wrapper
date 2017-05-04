// Obtained client id
var clientId = 1;

// Redirect url is set to the current url by default
var auth = new maps4news.ImplicitFlow(clientId);
var api = new maps4news.Maps4News(auth);

if (!api.authenticated) {
  window.location = '/login';
}