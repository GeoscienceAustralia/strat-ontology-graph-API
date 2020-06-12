#!/bin/bash

#This script does the work of loading spatial layers into the postgis db
#Preserving loading commands from Loc-I as a placeholder

#download files
wget https://github.com/nvkelso/natural-earth-vector/raw/master/geojson/ne_10m_admin_0_countries.geojson

#load spatial layers into postgis

HOST=$PG_HOSTNAME
PORT=$PG_PORT
DB=$PG_DBNAME
USER=$PG_USER
PASS=$PG_PASS

SPATIAL_LAYERS_MAP="
ne_10m_admin_0_countries.geojson|ne_10m_admin_0_countries
"

# load asgs files into postgis
for map in $SPATIAL_LAYERS_MAP; do
    ary=(${map//|/ })
    FNAME=${ary[0]}
    TNAME=${ary[1]}
    echo "Loading $FNAME into DB table: $TNAME"
    ogr2ogr -f "PostgreSQL"  PG:"host=${HOST} port=${PORT} dbname=${DB} user=${USER} password=${PASS}"  ${FNAME} -nln ${TNAME} -overwrite -progress -lco GEOMETRY_NAME=geom_3577 -lco PRECISION=NO -t_srs EPSG:3577 -nlt MULTIPOLYGON --config PG_USE_COPY YES
    #remove file to conserve disk
    rm ${FNAME}
done

#create views and count table
PGPASSWORD=$PASS psql -h $HOST -d $DB -U $USER  -p $PORT -a -w -f create_tables.sql

exit
