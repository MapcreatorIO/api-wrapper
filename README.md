Mapcreator Javascript API [![npm version](https://img.shields.io/npm/v/@mapcreator/api.svg)](https://www.npmjs.com/package/@mapcreator/api)
-------------------------

The Mapcreator API is a powerful mapping service built for our front-end applications. This library is released to
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

[download library]: https://docs.maps4news.com/wrapper/dist/bundle.js
[minified]: https://docs.maps4news.com/wrapper/dist/bundle.min.js

[installation]: https://docs.maps4news.com/wrapper/manual/installation/installation.html
[building]: https://docs.maps4news.com/wrapper/manual/installation/building.html
[api documentation]: https://api.beta.maps4news.com/docs/
[docs]: https://docs.maps4news.com/wrapper/
[docs-auth]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html
[manual]: https://docs.maps4news.com/wrapper/manual/index.html
[GitHub repo]: https://github.com/MapcreatorIO/api-wrapper
[esdoc]: https://esdoc.org
[example-basics]: examples/basics.js
[yarn]: https://yarnpkg.com
[webpack]: https://webpack.js.org
[LICENSE]: https://github.com/MapcreatorIO/api-wrapper/blob/master/LICENSE
[BSD-3-Clause]: https://tldrlegal.com/license/bsd-3-clause-license-(revised)

[ImplicitFlow]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html#implicit-flow
[ImplicitPopupFlow]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html#implicit-flow-pop-up
[PasswordFlow]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html#password-flow
[PasswordFlow-web]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html#password-flow-dangerous-
[DummyFlow]: https://docs.maps4news.com/wrapper/manual/example/examples.authentication.html#dummy-flow
