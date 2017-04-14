import ImplicitFlow from './oauth/ImplicitFlow';
import PasswordFlow from './oauth/PasswordFlow';
import ImplicitFlowPopup from "./oauth/ImplicitFlowPopup";
import {makeRequest} from "./util/requests";
import OAuthError from "./oauth/OAuthError";
import StateContainer from "./oauth/StateContainer";
import OAuthToken from "./oauth/OAuthToken";



// Make sure that the client id matches the return url
//const auth = new PasswordFlow('3', 'AsINdWqvfq9FEByLx3miui1NPgspnxRtpymwCiqM', 'test@example.com', 'test');
//const auth = new ImplicitFlowPopup('1');
const auth = new ImplicitFlow('1');
auth.host = 'http://localhost:8000';
console.log('Authenticated: ' + auth.authenticated);

window.onload = ()=> // Run auth code after window load
auth.authenticate().then(token => {
  console.log(token.toString());
  token.save();

  document.getElementById('content').innerHTML = 'Authenticated!\n';

  const headers = {
    Accept: 'application/json',
    Authorization: token.toString()
  };

  makeRequest(`${auth.host}/v1/users/me`, 'GET', '', headers).then(response => {
    const data = JSON.parse(response.responseText);

    document.getElementById('content').innerHTML += JSON.stringify(data, null, 2);
  }).catch(response => {
    const data = JSON.parse(response.responseText).error;

    const content = document.getElementById('content');
    content.innerHTML += JSON.stringify(data, null, 2);

    if(data.type === 'AuthenticationException') {
      StateContainer.clean();
      localStorage.removeItem(OAuthToken.storageName);

      content.innerHTML += '\n\nCleaned up localStorage';
    }

  });
}).catch(err => {
  document.getElementById('content').innerHTML = err.toString();
});