// @flow

import React, { createRef, Component } from 'react'
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import FeatureInfoItem from './FeatureInfoItem';
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import FindByPointGraphVisualiser from './FindByPointGraphVisualiser';
import proj from 'proj4';
import * as jsonld from 'jsonld';
import Button from "react-bootstrap/Button";
import FindByPointStratUnitInfo from './FindByPointStratUnitInfo';
import STRATNAME_PROP_WHITELIST from './data/stratname_prop_whitelist.json';
import PREFIXES from './data/prefixes.json'

const NAMESPACE_IDX = {
  'ttp://www.w3.org/2000/01/rdf-schema#' :'rdfs',
  'http://pid.geoscience.gov.au/def/stratname#' : 'stratname',
  'http://purl.org/dc/terms/' : 'dct',
  'http://www.w3.org/1999/02/22-rdf-syntax-ns#' : 'rdf',
}


export default class MainPageResultComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      hideMe: false,
      contextLocationLookups: {},
      location_uri: this.props.location_uri,
      locationResourceData: {},
      featureInfo: {
        "@id" : "",
        "rdfs:label" : "",
        "@type" : "",
      },
      featureRelationsInfo: {}
    }

  }

  componentDidMount() {
    //this.renderCurrentGeom();
    this.updateResourceInfo();

    this.setState({
      hideMe: this.props.hideMe,
      contextLocationLookups: {},
      location_uri: this.props.location_uri
    });
  }
  componentDidUpdate() {
    if(this.props.hideMe != this.state.hideMe) {
      this.setState({
        hideMe: this.props.hideMe
      });
    }
    if(this.props.location_uri != this.state.location_uri) {
      //this.renderCurrentGeom();
      this.updateResourceInfo();

      this.setState( {
        location_uri: this.props.location_uri
      })
    }    
  }
  

  updateResourceInfo() {
    fetch(process.env.REACT_APP_STRATNAMES_API_ENDPOINT + "/resource?uri=" + this.props.location_uri)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              locationResourceData: result
            });
            this.updateFeatureInfo(result);
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        );
    this.setState({
      contextLocationLookups: {},
      location_uri: this.props.location_uri
    });
  }

  renderCurrentGeom() {
    fetch(process.env.REACT_APP_STRATNAMES_API_ENDPOINT + "/resource?uri=" + this.props.location_uri)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              isLoaded: true,
              locationResourceData: result
            });
            this.loadGeom(result)
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({
              isLoaded: true,
              error
            });
          }
        );
    this.setState({
      contextLocationLookups: {},
      location_uri: this.props.location_uri
    });
  }

  

  convertTreeObjToD3Data(parent, node, graphData, idx = {}) {
    var curr = {
      'name': node['name'],
      'label': node['label']
    };

    if('class' in node) {
      curr['class'] = node['class']
    }

    //Add to node list only if not seen before
    if (!(curr['name'] in idx)) {
      graphData['nodes'].push(curr)
      idx[curr['name']] = 1
    }

    node['children'].forEach(item => {
      console.log(item)

      graphData['links'].push({
        "source": node['name'],
        "target": item['name']
      });

      this.convertTreeObjToD3Data(curr, item, graphData, idx)
    });

    return graphData;
  }

  callbackFunction = (uri, relation, data) => {
    console.log(uri);
    console.log(relation);
    console.log(data);

    var curr = this.state.contextLocationLookups;

    if (!(uri in curr)) {
      curr[uri] = {};
    }
    if (!(relation in curr[uri])) {
      curr[uri][relation] = {};
    }
    curr[uri][relation] = data;


    this.setState({
      contextLocationLookups: curr
    })
  }
  getGeomInfo = (uri) => {
      fetch(uri, {
        headers: {
          'Content-Type': 'application/json',
        },
      })
       .then(response => response.json())
       .then(data => {
         console.log(data)
       });
  }

  resolvePrefix(value) {
    var final_val = value;
    Object.keys(PREFIXES).forEach(function(prefix) {
      if(value.startsWith(prefix)) {
        const replaced = PREFIXES[prefix] + ":";
        final_val = value.replace(prefix, replaced);
      }
    });
    return final_val;
  }

  updateFeatureInfo(data) {
    var summary_info_whitelisted_items = [];
    var graph_whitelisted_items = []; 
    const here = this;
    //iterate through list of properties and check whitelist
    Object.keys(data).forEach(function(prop) {
      if(STRATNAME_PROP_WHITELIST.summary_info.includes(prop)) {
        summary_info_whitelisted_items.push({  
            "prop" : prop, 
            "prefixed_prop" : here.resolvePrefix(prop),
            "value" : data[prop] 
        });
      }
      if(STRATNAME_PROP_WHITELIST.graph_visualisation.includes(prop)) {
        graph_whitelisted_items.push({  
            "prop" : prop, 
            "prefixed_prop" : here.resolvePrefix(prop),
            "value" : data[prop] 
        });
      }
    });

    
    var thisFeatureInfo = {};
    summary_info_whitelisted_items.forEach(function(item, index) {
      thisFeatureInfo[item["prefixed_prop"]] =  here.resolvePrefix(item["value"]);
    });

    var thisFeatureRelationsInfo = {};
    graph_whitelisted_items.forEach(function(item, index) {
      thisFeatureRelationsInfo[item["prefixed_prop"]] = here.resolvePrefix(item["value"]);
    });

    this.setState({
      featureInfo: thisFeatureInfo,
      featureRelationsInfo: thisFeatureRelationsInfo
    })

  }

  loadGeom(location_resource) {

    var geom_uri = "";
    if("http://www.opengis.net/ont/geosparql#hasDefaultGeometry" in location_resource) {
       geom_uri = location_resource["http://www.opengis.net/ont/geosparql#hasDefaultGeometry"]
    }
    else if ("http://www.opengis.net/ont/geosparql#hasGeometry" in location_resource) {
       geom_uri = location_resource["http://www.opengis.net/ont/geosparql#hasGeometry"]
    }

    if(geom_uri == "") {
      return;
    }
    console.log('geometry uri:', geom_uri);
    //this.setState({
    //  currGeom: geom_uri
    //});

    if (typeof geom_uri === 'string' || geom_uri instanceof String) {
      geom_uri = geom_uri.replace("http:", "https:");
          //lookup geom and call update leaflet function with uri
    
      var geom_svc_headers = new Headers();
      geom_svc_headers.append('Accept', 'application/json');
      var here = this;
      if(geom_uri.indexOf("?") > -1) {
        geom_uri = geom_uri + "&_view=simplifiedgeom"
      }
      else {
        geom_uri = geom_uri + "?_view=simplifiedgeom"
      }
      fetch(geom_uri, {       
        headers: geom_svc_headers })
          .then(response => {
            console.log(response);
            return response.json()
          })
          .then(data => {
            console.log(data);
            here.props.renderSelectedGeometryFn(data);
          }
          )
          .catch(error => 
            { 
              //this.setState({ error, isLoading: false });
              console.log("Error getting ", geom_uri);
              console.log(error)
            }
            );

    }
    else {
      //handle geom object
      let geom_obj = geom_uri;
      var wkt = '';
      if("http://www.opengis.net/ont/geosparql#asWKT" in geom_obj) {
        wkt = geom_obj["http://www.opengis.net/ont/geosparql#asWKT"];
        var geojson = this.transformPointCrs(wkt);
        this.props.renderSelectedGeometryFn(geojson);
      }
    }
  }

  transformPointCrs(coord_str) {
    proj.defs("EPSG:4283","+proj=longlat +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +no_defs");
    var dest_crs = new proj.Proj("EPSG:4326");    //source coordinates will be in Longitude/Latitude
    var source_crs = new proj.Proj("EPSG:4283");

    var cstr = coord_str;
    let regexp = /<http:\/\/www.opengis.net\/def\/crs\/EPSG\/0\/(.*)> POINT\((.*) (.*)\)/;

    let result = cstr.match(regexp);
    console.log(result)

    let epsgCode = result[1];
    let coord1 = Number(result[2]);
    let coord2 = Number(result[3]);
    var p = [coord1, coord2];   //any object will do as long as it has 'x' and 'y' properties
    proj.transform(source_crs, dest_crs, p);      //do the transformation.  x and y are modified in place

    console.log(p);

    var geojson = {
      "type": "Feature",
      "geometry": {
          "type": "Point",
          "coordinates": p
      }
    };

    console.log(geojson);
    return geojson;

  }

  
  handleBackBtn = (e) => {
    this.props.callbackReturnToResultsFn();
  }


  buildGraph(uri, featureRelationsInfo, contextLocationLookups) {
    var rootObj = {
      'fixed': true,
      "isRoot" : true,
      'children': [],
      'name': uri,
      'label': uri,
      'children': []
    };
    var node = rootObj;
    var childCount = 0;
    var links = [];

    var graphData = {}
    graphData['links'] = [];
    graphData['nodes'] = [];

    var idx = {};

    graphData['nodes'].push(rootObj);

    for (let key in featureRelationsInfo) {
      var currNode = {
        'name': featureRelationsInfo[key],
        'label': featureRelationsInfo[key],
        'children': []
      }

      if (!(currNode['name'] in idx)) {
        graphData['nodes'].push(currNode)
        idx[currNode['name']] = 1
      }
      
      graphData['links'].push({
        "source": node['name'],
        "target": featureRelationsInfo[key],
        "label" : key
      });
      
    }      

    return graphData;
  }



  render() {
    var uri = this.state.location_uri;
    var featureRelationsInfo = this.state.featureRelationsInfo;
    var contextLocationLookups = this.state.contextLocationLookups;

    //var graphData = { "nodes": [], "links": [] };
    var graphData = this.buildGraph(uri, featureRelationsInfo, contextLocationLookups);

    //console.log(rootObj);
    //graphData = this.convertTreeObjToD3Data(null, rootObj, graphData, {});
    //console.log(graphData);

    var here = this;
    var divMain = (
      <div className="overflow-auto">
            <div id="stratname-graph"><FindByPointGraphVisualiser graphData={graphData} callback={this.props.renderResultSummaryFn} /></div>
      </div>
    );
    var here = this;

    return (
      !this.state.hideMe && 
      <Container>
        <Row>
          <Col sm={12} className="fullheight-results-main">
            <Button variant="outline-primary" size="sm" onClick={(e) => here.handleBackBtn(e)}>
                Back
            </Button>
            <div class="summaryResultTitle"> Showing summary for feature: <a href={uri}>{uri}</a> 
            </div>
            <div>
              <FeatureInfoItem item={this.state.featureInfo}/>
            </div>
            {divMain}


          </Col>
        </Row>
      </Container >
    )
  }



  buildGraphOld(uri, contextLocationLookups) {
    var rootObj = {
      'class': "root",
      'fixed': true,
      'children': [],
      'name': uri,
      'label': uri,
      'children': []
    };


    var node = rootObj;

    var childCount = 0;

    var withinChild = {
      'name': uri + "-within",
      'label': "within",
      'class' : "within",
      'children': []
    };
    if (uri in contextLocationLookups && 'within' in contextLocationLookups[uri]) {
      contextLocationLookups[uri]['within'].locations.forEach(item => {
        withinChild.children.push({
          'name': item,
          'label': item,
          'children': []
        });
      });
    }

    childCount = 0;
    var containChild = {
      'name': uri + "-contain",
      'label': "contain",
      'class' : "contain",
      'children': []
    };
    if (uri in contextLocationLookups && 'contain' in contextLocationLookups[uri]) {
      contextLocationLookups[uri]['contain'].locations.forEach(item => {
        
        if(childCount <= 25) {
          containChild.children.push({
            'name': item,
            'label': item,
            'children': []
          });
        }
        else {
          containChild['label'] = "contain (showing sample of 25 features)"
        }
        childCount = childCount + 1;
      });
    }

    childCount = 0;
    var overlapChild = {
      'name': uri + "-overlap",
      'label': "overlap",
      'class' : "overlap",
      'children': []
    };
    if (uri in contextLocationLookups && 'overlap' in contextLocationLookups[uri] && 'overlaps' in contextLocationLookups[uri]['overlap']) {
      contextLocationLookups[uri]['overlap'].overlaps.forEach(item => {
        overlapChild.children.push({
          'name': item.uri,
          'label': item.uri,
          'children': []
        });
      });
    }

    node.children.push(withinChild)
    node.children.push(containChild)
    node.children.push(overlapChild)    

    return rootObj;
  }
}


