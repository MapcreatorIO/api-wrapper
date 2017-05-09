(function() {
  if (window.name) {
    new window.maps4news.ImplicitFlowPopup(1);
  }
})();

function easyAuth() {
  var m4n = window.maps4news;

  var clientId = 3;
  var callback = 'https://mapcreatoreu.github.io/m4n-api/';
  var auth = new m4n.ImplicitFlowPopup(clientId, callback);
  var api = new m4n.Maps4News(auth);

  api.host = 'https://api.beta.maps4news.com/';

  return api.authenticate();
}

console.log('You can play around with the api in here, the library is bound to window.maps4news. Authentication can easily be done by running the command easyAuth()');
console.log('window.maps4news =', window.maps4news);
console.log('Example: easyAuth().then(api => window.api = api);');
