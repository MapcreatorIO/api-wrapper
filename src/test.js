import ImplicitFlow from './oauth/ImplicitFlow';
import Maps4News from './Maps4News';
import Color from './crud/Color';

const api = new Maps4News(new ImplicitFlow('1'));

api.host = 'http://localhost:8000';

api.authenticate().then(() => {
  const content = document.getElementById('content');

  content.innerHTML = '';

  api.users.get('me').then(user => {
    user.profession = 'Developer';

    console.log('saving');
    user.save().then(console.log).catch(console.log);
  });

  api.users.get('me').then(user => {
    content.innerHTML += JSON.stringify(user, null, 2);
  });
});
