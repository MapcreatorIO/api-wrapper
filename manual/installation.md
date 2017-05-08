# Installation
Installation can be done through either [npm] or [yarn].

```sh
// Using npm
npm install --save @mapcreator/maps4news

// Using yarn
yarn add @mapcreator/maps4news
```

After installation the package can be imported as follows:

```js
var m4n = require('@mapcreator/maps4news');

// Do stuff
var auth = new m4n.ImplicitFlow(1);
var api = new m4n.Maps4News(auth);
```

[npm]: https://npmjs.com
[yarn]: https://yarnpkg.com