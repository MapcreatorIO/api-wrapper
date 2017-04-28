import ImplicitFlow from './oauth/flows/ImplicitFlow';
import Maps4News from './Maps4News';
import Color from './crud/Color';

const api = new Maps4News(new ImplicitFlow('1'));

api.host = 'http://localhost:8000';

api.authenticate().then(() => {
  const content = document.getElementById('content');

  content.innerHTML = '';

  api.colors.get(1).then(color => {
    content.innerHTML += JSON.stringify(color, null, 2);

    // Updates the record
    color.name = 'something';
    color.save();

    // calling `delete resource.id` or setting it to
    // null creates a new record when saving.
    color.id = null;
    color.save();
  });

  const data = {name: 'fabulously pink', hex: '#ff81f3'};

  // These two are the same
  api.colors.new(data).save();
  new Color(api, data).save();
});
