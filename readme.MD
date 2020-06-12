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


