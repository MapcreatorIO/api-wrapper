# Installation
Installation can be done through either [npm] or [yarn].

```sh
// Using npm
npm install --save @mapcreator/api

// Using yarn
yarn add @mapcreator/api
```

After installation the package can be imported as follows:

```js
var m4n = require('@mapcreator/api');

// Do stuff
var auth = new m4n.ImplicitFlow(1);
var api = new m4n.Maps4News(auth);
```

or using ES6 import statements:

```js
import {Mapcreator, DummyFlow} from '@mapcreator/api';

// Do stuff
var auth = new DummyFlow();
var api = new Mapcreator(auth);
```

[npm]: https://npmjs.com
[yarn]: https://yarnpkg.com