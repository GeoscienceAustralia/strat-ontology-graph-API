# Stratigraphic Units Knowledge Platform

Includes ontology, graph database, API.

More to come.

## Geometry Data Service

```
$ docker-compose -f docker-compose.gds.yml up -d
```

Add your spatial layers in `/gds/load_spatial_data/` or 
configure and modify `gds/load_spatial_data/entrypoint.sh`
to download your spatial layers and load it into PostGIS.

The current GDS is configured to load countries of the world dataset.

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

