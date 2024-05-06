#!/usr/bin/env bash

docker run --rm -it -v $PWD/..:/app -v $PWD/../node_modules_docker:/app/node_modules suchipi/node-nw-env:0.7.0
