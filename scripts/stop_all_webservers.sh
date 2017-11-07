#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

for pidFile in build/http-*.pid
do
  if [ "$pidFile" != "build/http-*.pid" ]; then
    kill `cat "$pidFile"` 2>&- >&-
    rm "$pidFile"
  fi
done