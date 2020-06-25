from .functions import query_graphdb_endpoint, get_resource
from .config import GEOM_DATA_SVC_ENDPOINT
import requests

def find_at_location(lat, lon, feature_type="any", crs=4326, count=1000, offset=0):
    """
    :param lat:
    :type lat: float
    :param lon:
    :type lon: float
    :param crs:
    :type crs: int
    :param count:
    :type count: int
    :param offset:
    :type offset: int
    :return:
    """
    row = {}
    results = {}
    counter = 0
    params = {
       "_format" : "application/json",
       "crs": crs
    }
    headers = {
       "Accept" : "application/json"
    }
    formatted_resp = {
        'ok': False
    }
    http_ok = [200]
    if feature_type == 'any':
       search_by_latlng_url = GEOM_DATA_SVC_ENDPOINT + "/search/latlng/{},{}".format(lon,lat)
    else:
       search_by_latlng_url = GEOM_DATA_SVC_ENDPOINT + "/search/latlng/{},{}/dataset/{}".format(lon, lat, feature_type)
    try:
        resp = requests.get(search_by_latlng_url, params=params, headers=headers)
        if resp.status_code not in http_ok:
            formatted_resp['errorMessage'] = "Could not connect to the geometry data service at {}. Error code {}".format(GEOM_DATA_SVC_ENDPOINT, resp.status)
            return formatted_resp
        formatted_resp = resp.json()
        formatted_resp['ok'] = True
    except:
        formatted_resp['errorMessage'] = "Could not connect to the geometry data service at {}. Error thrown.".format(GEOM_DATA_SVC_ENDPOINT)
        return formatted_resp
    r = formatted_resp['res']
    del(formatted_resp['res'])
    meta = formatted_resp
    meta['offset'] = offset

    #query triple store for the features with input geom
    for geom_res in r:
       ### TODO: Replace the following hacky solution
       #geom_uri = geom_res['geometry'] ##Commenting this out for when the geom uri is stable. 
       #use the id for now and build a URI
       geom_uri = "https://gds.loci.cat/geometry/stratnames/u{}".format(geom_res['id'])
       arrFeatures = fetch_feature_for_geom(geom_uri)
       geom_res['feature'] = arrFeatures

    returned_resp = { "meta" : meta, "results": r }
    return returned_resp, 200

def fetch_feature_for_geom(geom_uri, limit=1000, offset=0):
   sparql = """\
PREFIX geo: <http://www.opengis.net/ont/geosparql#>
select ?feature where {{ 
    ?feature geo:hasGeometry <{g_uri}> .
}}
""".format(g_uri=geom_uri)
   resp = query_graphdb_endpoint(sparql, limit=limit, offset=offset)
   arr_features = []
   if 'results' not in resp:
      return resp_object
   bindings = resp['results']['bindings']
   for b in bindings:
      arr_features.append(b['feature']['value'])
   return arr_features
