import ImplicitFlow from './oauth/ImplicitFlow';
import Maps4News from './Maps4News';
import Color from './crud/Color';

const api = new Maps4News(new ImplicitFlow('1'));

api.host = 'http://localhost:8000';

api.authenticate().then(() => {
  const content = document.getElementById('content');

  content.innerHTML = '';

  api.request('/users/me').then(data => {
    content.innerHTML += JSON.stringify(data, null, 2);
  });

  api.color.get(1).then(color => {
    content.innerHTML += JSON.stringify(color, null, 2);
    window.exportColor = color;
  });
});
