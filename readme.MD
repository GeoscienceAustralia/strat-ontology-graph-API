# Stratigraphic Units Knowledge Platform

Includes ontology, graph database, API.

More to come.


## GraphDB deployment

### Pre-requisites
* docker
* docker-compose

### Quickstart

Add your RDF files in `strat_graph_data`. This will then be loaded into the GraphDB instance
```
$ ./startup.sh --local-build
```

The GraphDB will be available at http://localhost:7200. If you would like to change the port,
edit `.env` and the `PORT` environment variable.
