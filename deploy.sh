#!/bin/bash

git pull origin main

echo "Building server"
docker compose -f ./docker-compose.yml up -d --build