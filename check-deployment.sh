#!/bin/bash

#check graphdb
if curl --silent -G http://localhost:7200/rest/repositories -H 'Accept: application/json' | grep 'default' > /dev/null ; 
then
   echo "GraphDB check: Pass"
else
   echo "GraphDB check: Failed"
fi

#check geom data service 
if curl --silent -G http://localhost:3000/geometry/ -H 'Accept: application/json' | grep 'Geometries Register' > /dev/null ; 
then
   echo "Geometry Data Service check: Pass"
else
   echo "Geometry Data Service check: Failed"
fi

#check REST API service 
if curl --silent -G http://localhost:8080/stratnames -H 'Accept: application/json' | grep 'results' > /dev/null ; 
then
   echo "Stratnames REST API Service check: Pass"
else
   echo "Stratnames REST API Service check: Failed"
fi
