import ImplicitFlow from './oauth/ImplicitFlow';
import Maps4News from './Maps4News';

const api = new Maps4News(new ImplicitFlow('1'));

api.host = 'http://localhost:8000';

api.authenticate().then(() => {
  api.request('/users/me').then(data => {
    const content = document.getElementById('content');

    content.innerHTML = JSON.stringify(data, null, 2);
  });
});
