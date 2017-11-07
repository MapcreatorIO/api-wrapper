#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

port=`./scripts/random_port.py`
directory=$1

if [ -z ${directory} ]; then
  directory=`pwd`
fi

if [ ! -d "$directory" ]; then
  echo "Directory '$directory' does not exist"
  exit 1
fi

mkdir build 2>/dev/null

echo "Starting webserver localhost:$port for $directory" >&2
php -S 127.0.0.1:${port} -t "$directory" 1>/dev/null 2>/dev/null &
echo $! > "build/http-$port.pid"
echo ${port}

sleep 1

exit 0