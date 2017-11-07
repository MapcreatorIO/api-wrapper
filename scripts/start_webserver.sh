#!/usr/bin/env bash

if [[ $(basename $(pwd)) == "scripts" ]]; then
  cd ..
fi

port=`./scripts/random_port.py`
directory=$1

if [ -z ${directory} ]; then
  directory=`pwd`
fi

mkdir build 2>/dev/null

echo "Starting webserver localhost:$port for $directory" >&2
php -S localhost:${port} -t "$directory" 1>&- 2>&- &
echo $! > "build/http-$port.pid"
echo ${port}

exit 0