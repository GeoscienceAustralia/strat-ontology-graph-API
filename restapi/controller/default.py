import flask
from .functions import get_resource

def go_home():
    response = flask.send_from_directory('static', "index.html")
    response.direct_passthrough = False
    return response

def query_for_resource(uri):
    resource = get_resource(uri)
    return resource, 200
