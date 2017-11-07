#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

for pidFile in build/http-*.pid
do
  kill `cat "$pidFile"`
  rm "$pidFile"
done