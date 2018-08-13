#!/usr/bin/env bash

set -o xtrace

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

mkdir -pv build

# build
npx webpack

# Our dirty little secret
awk 'NR==1,/window/{sub(/window/, "typeof window === \"undefined\" ? global : window")} 1'  dist/bundle.js > dist/bundle.fix.js
mv dist/bundle.fix.js dist/bundle.js

# Remove empty sourcemap and references
rm dist/bundle.min.js.map
sed -e '$ d' dist/bundle.min.js > dist/bundle.min.js~
mv dist/bundle.min.js~ dist/bundle.min.js

# Compress minified bundle
gzip dist/bundle.min.js -9knf
gzip -l dist/bundle.min.js.gz
