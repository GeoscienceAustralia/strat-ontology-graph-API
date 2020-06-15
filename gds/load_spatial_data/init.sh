#!/bin/bash
echo "in init.sh"
echo "${PG_HOSTNAME}:${PG_PORT} "
/wait-for-it.sh ${PG_HOSTNAME}:${PG_PORT} -t 0 -- /app/entrypoint.sh
