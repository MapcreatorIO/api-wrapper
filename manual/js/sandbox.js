(function() {
  if (window.name) {
    new window.maps4news.ImplicitFlowPopup(1);
  }
})();


function easyAuth() {
  var m4n = window.maps4news;

  var clientId = 3;
  var docsUrl = 'https://mapcreatoreu.github.io/api-wrapper/';
  var auth = new m4n.ImplicitFlowPopup(clientId, docsUrl);
  var api = new m4n.Maps4News(auth);

  api.host = 'https://api.beta.maps4news.com/';

  return api.authenticate();
}

console.log('You can play around with the api in here, the library is bound to window.maps4news. Authentication ');
console.log('can easily be done by running the command easyAuth(). See the docs for more information here: ');
console.log('https://mapcreatoreu.github.io/api-wrapper/manual/example/examples.authentication.html');
console.log('Example: easyAuth().then(api => window.api = api);');
console.log('window.maps4news =', window.maps4news);

