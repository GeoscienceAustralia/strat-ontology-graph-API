# Stratigraphic Units Knowledge Platform

Includes ontology, graph database, API.


## Getting started

### Spinning up infrastructure

1. Bring up the GraphDB instance
```
$ ./startup-graphdb.sh --local-build
```

2. Bring up the GDS
```
$ docker-compose -f docker-compose.gds.yml up -d --build
```

3. Bring up the REST API and Explorer app

If need be, edit the `explorer_app/.env` file and update the
`REACT_APP_STRATNAMES_API_ENDPOINT` or `REACT_APP_GDS_TO_URL_PREFIX`.
If only testing the REST API - ignore this bit.
`REACT_APP_STRATNAMES_API_ENDPOINT` should point to a resolvable
stratnames REST API endpoint (with the actual API because your 
browser will be resolving the URL at client side).
`REACT_APP_GDS_TO_URL_PREFIX` similarly will need to point to the 
GDS instance resolvable at client side, so use an IP that will 
work.

Then run the following to bring up the REST API and explorer app.

```
$ docker-compose -f docker-compose.api.yml up -d --build
```

Test the deployment using
```
$ ./check-deployment.sh
```

### Bring down the infrastructure

```
$ docker-compose -f docker-compose.api.yml -f docker-compose.gds.yml -f docker-compose.yml down -v

```

## GraphDB deployment

### Pre-requisites
* docker
* docker-compose

### Start the GraphDB instance

Add your RDF files in `strat_graph_data`. This will then be loaded into the GraphDB instance
```
$ ./startup-graphdb.sh --local-build
```

The GraphDB will be available at http://localhost:7200. If you would like to change the port,
edit `.env` and the `PORT` environment variable.

### Running graphdb in remote-build mode

You can run graphdb in remote build mode, which means running the download-data.sh script to populate
the data directory to load into graphDB at build time. By default it downloads the Pizza OWL ontology.
```
$ ./startup.sh --remote-build
```

To specify your own download-data.sh script, you can map that into the docker container. 
Edit the docker-compose.yml file to add that in like so (last line in the example below) in the `volumes` section.
```
   volumes:
      - "/tmp:/tmp"
      - "graphdb_data:${GRAPHDB_HOME}"
      - "./strat_graph_data:${GRAPHDB_SOURCE}"
      - "./custom-download-data.sh:/app/download-data.sh"
```

## Geometry Data Service

```
$ docker-compose -f docker-compose.gds.yml up -d --build
```

Add your spatial layers in `/gds/load_spatial_data/` or 
configure and modify `gds/load_spatial_data/entrypoint.sh`
to download your spatial layers and load it into PostGIS.

The current GDS is configured to load the Strat Relations Geojson dataset.

To bring down the GDS, run the following:
```
$ docker-compose -f docker-compose.gds.yml down -v 
```

### Environment variables

Modify `GDS_PORT` in .env to specify which port GDS should be deployed to.

Modify `docker-compose.gds.yml` to update default settings for the DB credentials
or specify those values in .env
```
"GSDB_DBNAME=${GSDB_DBNAME:-gis}"
"GSDB_HOSTNAME=${GSDB_HOSTNAME:-db}"
"GSDB_PORT=${GSDB_PORT:-5432}"
"GSDB_USER=${GSDB_USER:-jon}"
"GSDB_PASS=${GSDB_PASS:-jon}"
"GSDB_CLIENT_MAX_CONN_POOL=${GSDB_CLIENT_MAX_CONN_POOL:-30}"
```

## REST API


Bring up the REST API
```
$ docker-compose -f docker-compose.api.yml up -d --build
```

Configure `.env` to bind the GEOM_DATA_SVC_ENDPOINT variable to the 
desired GDS instance. The default is a local deployment at http://gds:3000

