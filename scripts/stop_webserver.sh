#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

pidFile="build/http-${1}.pid"

kill `cat ${pidFile}`
rm ${pidFile}