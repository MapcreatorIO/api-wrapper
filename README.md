Maps4News Javascript API
-------------------------

The Maps4News API is a powerful mapping service built for our front-end applications. This library is released to 
provide a painless way of talking to the api using Javascript. See the [LICENSE] file for licensing information. Api 
tokens can be granted through support requests. The docs can be found [here][docs]. Please refer to the 
[api documentation] for resource information.


## Download
The library is built to be ran in either the browser or using nodejs. 

- [web][build-web] ([minified][build-web-minified])
- [nodejs][build-node] ([minified][build-node-minified])

The source code can be found on the [GitHub repo]. The `master` branch is stable and the `develop` branch is unstable. 

## Building
Building the api can be done using [yarn] and [webpack]. The result will be placed in the `/dist` folder. Both the web 
and nodejs releases are built this way.

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
Authentication can be done using OAuth. Examples of how to use authentication can be found [in the documentation][docs-auth]. The 
following authentication methods are supported: 
 - ImplicitFlow 
 - ImplicitPopupFlow
 - PasswordFlow
 - DummyFlow

## Examples
Examples can be found in the documentation under the "[Manual]" section.

## License
See the [LICENSE] file for license information. This project is licensed under a [BSD-3-Clause] license.

[build-web]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.web.js
[build-web-minified]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.web.min.js
[build-node]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.node.js
[build-node-minified]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.node.min.js

[api documentation]: https://api.beta.maps4news.com/docs/
[docs]: https://mapcreatoreu.github.io/m4n-api/
[docs-auth]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html
[manual]: https://mapcreatoreu.github.io/m4n-api/manual/index.html
[GitHub repo]: https://github.com/MapCreatorEU/m4n-api
[esdoc]: https://esdoc.org
[example-basics]: examples/basics.js
[yarn]: https://yarnpkg.com
[webpack]: https://webpack.js.org
[LICENSE]: https://github.com/MapCreatorEU/m4n-api/blob/master/LICENSE
