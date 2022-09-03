#!/bin/bash

git pull origin main

echo "Building server"
docker compose up -d --build