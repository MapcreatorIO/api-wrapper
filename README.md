Maps4News Javascript API
-------------------------

The Maps4News API is a powerful mapping service built for our front-end applications. This library is released to provide a painless way of talking to the api using Javascript. See the [LICENSE] file for licensing information. Api tokens can be granted through support requests.

## Download
The library is built to be ran in either the browser or using nodejs. 

- [web][build-web] ([minified][build-web-minified])
- [nodejs][build-node] ([minified][build-node-minified])

## Building
Building the api can be done using [yarn] and [webpack]. The result will be placed in the `/dist` folder. Both the web and nodejs releases are built this way.

```sh
yarn install
./node_modules/.bin/webpack --progress
```

## Building docs
The docs can be built using [esdoc] after which they can be found in the `/docs` folder.
```sh
yarn install
./node_modules/.bin/esdoc
```


## Authenticating
Authentication can be done using OAuth. Examples of how to use authentication can be found in the examples directory: 
 - [ImplicitFlow](examples/web/implicitFlowExample.js) (recommended)
 - [ImplicitPopupFlow](examples/web/implicitFlowPopupExample.js)
 - [PasswordFlow](examples/web/passwordFlowExample.js)
 - [PasswordFlow](examples/node/passwordFlowExample.js) (node)

## Examples
These examples can also be found [here][example-basics]. These are the bare basics for using the API. Please refer to the extended documentation once available.

```js
// this example assumes that an instance of the api exists and is authenticated.
// See the folders node and web for authentication information

// Create a new color and dump the new resource
// to the console after saving
var data = {name: 'Smurf', hex: '88CCFF'};
api.colors.new(data).save().then(console.dir);

// Changes the profession of the current user
api.users.get('me').then(me => {
  me.profession = 'Developer';
  me.save(); // Optional chaining to get the updated resource
});

// Clone resource
api.colors(1).then(color => {
  color.id = null; // Setting the id to null forces the creation of a new object
  color.save();
});

// Listing resources with pagination. First page with 5 items per page
api.colors.list(1, 5).then(page => {
  console.log('Got resources:');

  for (var i = 0; i < page.data.length; i++) {
    console.log(page.data[i].toString());
  }
});

// Select current user but do not fetch any info to make fetching resources easier
api.users.select('me').colors().then(page => {
  console.dir(page.data);
});
```

## License
See the [LICENSE] file for license information. This project is licensed under a BSD-3-Clause license.

[build-web]: /path/to/build
[build-web-minified]: /path/to/build
[build-node]: /path/to/build
[build-node-minified]: /path/to/build

[esdoc]: https://esdoc.org
[example-basics]: examples/basics.js
[yarn]: https://yarnpkg.com
[webpack]: https://webpack.js.org
[LICENSE]: LICENSE