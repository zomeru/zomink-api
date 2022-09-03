#!/bin/bash

git pull

echo "Building server"
docke compose -f ./docker-compose.yml up -d --build