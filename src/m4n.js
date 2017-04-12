import ImplicitFlow from './oauth/ImplicitFlow';
import PasswordFlow from './oauth/PasswordFlow';

// Make sure that the client id matches the return url
const auth = new PasswordFlow('5');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

auth.authenticate();

console.log(auth.token.toString());
auth.token.save();
