#!/usr/bin/env bash

set -o xtrace

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

npm run clean
npm run lint
npm run build
npm run test
npm run docs