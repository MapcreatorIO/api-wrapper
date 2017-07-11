# Building
Building the api can be done using [yarn] and [webpack]. The result will be placed in the `/dist` folder. Both the web 
and nodejs releases are built this way.

```sh
yarn install
yarn run build
```

## Building docs
The docs can be built using [esdoc] after which they can be found in the `/docs` folder.

```sh
yarn install
yarn run docs
```

Development docs can be built by adding `"private"` to the `esdoc.access` variable in `package.json` before building the
docs. 