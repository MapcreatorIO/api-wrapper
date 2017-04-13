import ImplicitFlow from './oauth/ImplicitFlow';
import PasswordFlow from './oauth/PasswordFlow';
import ImplicitFlowPopup from "./oauth/ImplicitFlowPopup";
import {makeRequest} from "./util";

localStorage.clear();

// Make sure that the client id matches the return url
//const auth = new PasswordFlow('2', 'PaP9APjSrJ8G206OJTUxGHQnfo2fDTt1FysCN5UU', 'test@example.com', 'test', '');
//const auth = new ImplicitFlowPopup('1');
//const auth = new ImplicitFlow('1');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

auth.authenticate().then(token => {
  console.log(token.toString());
  token.save();

  document.getElementById('content').innerHTML = 'Authenticated!\n';

  const headers = {
    Accept: 'application/json',
    Authorization: token.toString()
  };
  makeRequest('http://localhost:8000/v1/users/me', 'GET', '', headers).then(response => {
    const data = JSON.parse(response.responseText);

    document.getElementById('content').innerHTML += JSON.stringify(data, null, 2);
  });
});
