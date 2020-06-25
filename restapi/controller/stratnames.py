from .functions import query_graphdb_endpoint, get_resource

def get():
   limit = 2000
   offset = 0
   sparql = """\
PREFIX strat: <http://pid.geoscience.gov.au/def/stratname#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX time: <http://www.w3.org/2006/time#>
SELECT ?id ?name ?btime ?ttime ?tconcept
WHERE
{
   ?tconcept a strat:Unit ;
      strat:bottomAge ?bera ;
      strat:topAge ?tera ;
      rdfs:label ?name ;
      dcterms:identifier ?id .
   ?bera time:hasBeginning/time:inTemporalPosition/time:numericPosition ?btime ; 
      time:hasBeginning/time:inTemporalPosition/time:hasTRS <http://resource.geosciml.org/classifier/cgi/geologicage/ma> . 
      ?tera time:hasEnd/time:inTemporalPosition/time:numericPosition ?ttime ; 
      time:hasEnd/time:inTemporalPosition/time:hasTRS <http://resource.geosciml.org/classifier/cgi/geologicage/ma> .  
}
ORDER BY ?btime
"""
   resp = query_graphdb_endpoint(sparql, limit=limit, offset=offset)
   arr_strat = []
   if 'results' not in resp:
      return resp_object
   bindings = resp['results']['bindings']
   for b in bindings:
      resp_object = {}
      resp_object['id'] = b['id']['value']
      resp_object['uri'] = b['tconcept']['value']
      resp_object['name'] = b['name']['value']
      resp_object['btime'] = b['btime']['value']
      resp_object['ttime'] = b['ttime']['value']
      arr_strat.append(resp_object)
   meta = {
      'count': len(arr_strat),
      'offset': offset,
   }
   response = {
      "meta": meta,
      "results": arr_strat,
   }
   return response, 200
