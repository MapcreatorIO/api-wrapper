import ImplicitFlow from './oauth/ImplicitFlow';
import PasswordFlow from './oauth/PasswordFlow';

// Make sure that the client id matches the return url
const auth = new ImplicitFlow('5');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

auth.authenticate().then(token => {
  console.log(token.toString());
  token.save();
});

