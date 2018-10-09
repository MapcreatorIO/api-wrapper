#!/usr/bin/env bash

set -o xtrace

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

mkdir -pv build/{coverage}

npx jest --coverage --ci --clearCache
