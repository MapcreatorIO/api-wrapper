#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

for pidFile in build/http-*.pid
do
  if [ "$pidFile" != "build/http-*.pid" ]; then
    port=`echo ${pidFile} | grep -o -- '-[0-9]*' | sed s/-//`
    echo "Stopping webserver on port $port"
    kill `cat "$pidFile"` 2>&- >&-
    rm "$pidFile"
  fi
done