import requests
from .config import TRIPLESTORE_CACHE_SPARQL_ENDPOINT
from json import JSONDecodeError
import logging
from json import loads
import os
import json

counter = 0
def query_graphdb_endpoint(sparql, infer=True, same_as=True, limit=1000, offset=0):
    """
    Pass the SPARQL query to the endpoint. The endpoint is specified in the config file.

    :param sparql: the valid SPARQL text
    :type sparql: str
    :param infer:
    :type infer: bool
    :param same_as:
    :type same_as: bool
    :param limit:
    :type limit: int
    :param offset:
    :type offset: int
    :return:
    :rtype: dict
    """
    global counter
    counter = counter + 1
    args = {
        'query': sparql,
        'infer': 'true' if bool(infer) else 'false',
        'sameAs': 'true' if bool(same_as) else 'false',
        'limit': int(limit),
        'offset': int(offset),
    }
    headers = {
        'Accept': "application/sparql-results+json,*/*;q=0.9",
        'Accept-Encoding': "gzip, deflate",
    }
    resp = requests.post(TRIPLESTORE_CACHE_SPARQL_ENDPOINT, data=args, headers=headers)
    resp_content = resp.text
    try:
        return loads(resp_content)
    except JSONDecodeError as e:
        logging.error("Bad response querying {0}".format(sparql))
        raise 

def get_resource(resource_uri):
    """
    :param resource_uri:
    :type resource_uri: str
    :return:
    """
    sparql = """\
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?p ?o ?p1 ?o1 ?p2 ?o2
WHERE {
    {
        ?s rdf:subject <URI> ;
           rdf:predicate ?p;
           rdf:object ?o .
        OPTIONAL { FILTER (isBlank(?o))
            {
                ?s2 rdf:subject ?o ;
                rdf:predicate ?p1;
                rdf:object ?o1 .
            }
            UNION
            { ?o ?p1 ?o1 . }
            OPTIONAL { FILTER (isBlank(?o1))
                ?o1 ?p2 ?o2 .
            }
        }
    }
    UNION
    {
        <URI> ?p ?o .
        OPTIONAL { FILTER (isBlank(?o))
            {
                ?s3 rdf:subject ?o ;
                rdf:predicate ?p1;
                rdf:object ?o1 .
            }
            UNION
            { ?o ?p1 ?o1 . }
            OPTIONAL { FILTER (isBlank(?o1))
                ?o1 ?p2 ?o2 .
            }
        }
    }
}
"""
    sparql = sparql.replace("<URI>", "<{}>".format(str(resource_uri)))
    resp = query_graphdb_endpoint(sparql)
    resp_object = {}
    if 'results' not in resp:
        return resp_object
    bindings = resp['results']['bindings']
    for b in bindings:
        pred = b['p']['value']
        obj = b['o']
        if obj['type'] == "bnode":
            try:
                obj = resp_object[pred]
            except KeyError:
                resp_object[pred] = obj = {}
            pred1 = b['p1']['value']
            obj1 = b['o1']
            if obj1['type'] == "bnode":
                try:
                    obj1 = obj[pred1]
                except KeyError:
                    obj[pred1] = obj1 = {}
                pred2 = b['p2']['value']
                obj2 = b['o2']['value']
                obj1[pred2] = obj2
            else:
                obj1 = obj1['value']
            obj[pred1] = obj1
        else:
            obj = obj['value']
        resp_object[pred] = obj
    return resp_object



async def query_build_response_bindings(sparql, count, offset, bindings):
    """
    :param sparql:
    :type sparql: str
    :param count:
    :type count: int
    :param offset:
    :type offset: int
    :return:
    """
    resp = query_graphdb_endpoint(sparql, limit=count, offset=offset)
    if 'results' in resp and 'bindings' in resp['results']:
        if len(resp['results']['bindings']) > 0:
            if len(resp['results']['bindings'][0].keys()) > 0:
                bindings.extend(resp['results']['bindings'])



