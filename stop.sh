#!/bin/bash
set -e


docker-compose stop graphcache
docker-compose rm -f graphcache
