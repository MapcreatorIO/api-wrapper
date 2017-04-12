import ImplicitFlow from './oauth/ImplicitFlow';

// Make sure that the client id matches the return url
const auth = new ImplicitFlow('5');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

auth.authenticate();

console.log(auth.token.toString());
auth.token.save();
