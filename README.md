Maps4News Javascript API [![npm version](https://img.shields.io/npm/v/@mapcreator/maps4news.svg)](https://www.npmjs.com/package/@mapcreator/maps4news)
-------------------------

The Maps4News API is a powerful mapping service built for our front-end applications. This library is released to 
provide a painless way of talking to the api using Javascript. See the [LICENSE] file for licensing information. Api 
tokens can be granted through support requests.

## Documentation
The documentation can be found [here][docs]. Please refer to the [api documentation] for resource information. Job structure documentation will be released soon. 

## Installation
Please refer to the installation docs [here][installation].

## Download
The library is built to be ran in either the browser or using nodejs. 

- [download library]
- [minified]

The source code can be found on the [GitHub repo]. The `master` branch is used minor versions and the `develop` branch is patches. 

## Building
Please refer to the build docs [here][building]

## Authenticating
Authentication can be done using OAuth. Examples of how to use authentication can be found [in the documentation][docs-auth]. The 
following authentication methods are supported: 
 - [ImplicitFlow]
 - [ImplicitPopupFlow]
 - [PasswordFlow] ([web][PasswordFlow-web])
 - [DummyFlow]

## Examples
Examples can be found in the documentation under the "[Manual]" section.

## License
See the [LICENSE] file for license information. This project is licensed under a [BSD-3-Clause] license.

[download library]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.js
[minified]: https://mapcreatoreu.github.io/m4n-api/dist/bundle.min.js

[installation]: https://mapcreatoreu.github.io/m4n-api/manual/installation/installation.html
[building]: https://mapcreatoreu.github.io/m4n-api/manual/installation/building.html
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
[BSD-3-Clause]: https://tldrlegal.com/license/bsd-3-clause-license-(revised)

[ImplicitFlow]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html#implicit-flow
[ImplicitPopupFlow]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html#implicit-flow-pop-up
[PasswordFlow]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html#password-flow
[PasswordFlow-web]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html#password-flow-dangerous-
[DummyFlow]: https://mapcreatoreu.github.io/m4n-api/manual/example/examples.authentication.html#dummy-flow