#!/bin/bash

git pull origin main

echo "Building server"
docke compose -f ./docker-compose.yml up -d --build