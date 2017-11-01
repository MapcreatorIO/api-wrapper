#!/usr/bin/env bash

set -o xtrace

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

mkdir -pv build

npx nyc --all --report-dir build/coverage --clean -n 'src/**.js' -r html -r cobertura npx ava -t | tee build/ava.tap

