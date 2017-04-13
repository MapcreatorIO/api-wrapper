import ImplicitFlow from './oauth/ImplicitFlow';
import PasswordFlow from './oauth/PasswordFlow';
import ImplicitFlowPopup from "./oauth/ImplicitFlowPopup";

localStorage.clear();

// Make sure that the client id matches the return url
//const auth = new PasswordFlow('2', 'PaP9APjSrJ8G206OJTUxGHQnfo2fDTt1FysCN5UU', 'test@example.com', 'test', '');
const auth = new ImplicitFlowPopup('1');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

auth.authenticate().then(token => {
  console.log(token.toString());
  token.save();
});
