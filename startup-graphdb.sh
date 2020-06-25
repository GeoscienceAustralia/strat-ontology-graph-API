#!/bin/bash
set -e

if [ -n "$1" ]
then
    if [ "$1" == "--remote-build" ]
    then
        export FORCE_REFRESH=1

        # run and wait for exit (build)
        docker-compose up --build --force-recreate --abort-on-container-exit
        
        unset FORCE_REFRESH
    elif [ "$1" == "--local-build" ]
    then
        export SKIP_DOWNLOAD=1
        export FORCE_REFRESH=1
        echo "Skipping download phase and building"
        # run and wait for exit (build)
        echo "docker-compose up --force-recreate --abort-on-container-exit"
        docker-compose up --force-recreate --abort-on-container-exit
        
        unset FORCE_REFRESH
        unset SKIP_DOWNLOAD 
    elif [ "$1" == "--debug" ]
    then
	echo "debug"
    else
        echo "--rebuild or --local-build is the only valid option to this script"
        exit 1
    fi
fi

#start the service with a restart parameter set.
if [[ -n "$1" ]] && [[ "$1" == "--local-build" ]]
then
   docker-compose -f docker-compose.yml -f docker-compose.restart.yml up -d --build --force-recreate
elif [[ -n "$1" ]] && [[ "$1" == "--remote-build" ]]
then
   docker-compose -f docker-compose.yml -f docker-compose.restart.yml up -d --build --force-recreate
else 
   #default is a local build
   docker-compose -f docker-compose.yml -f docker-compose.restart.yml up -d --build --force-recreate
fi

#Use this to see the logs if needed
#docker-compose logs -f
