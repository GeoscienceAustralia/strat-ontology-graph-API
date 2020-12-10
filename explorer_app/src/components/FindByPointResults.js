// @flow

import React, { createRef, Component } from 'react'
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import Dropdown from "react-bootstrap/Dropdown";
import Tabs from "react-bootstrap/Tabs";
import Tab from "react-bootstrap/Tab";
import FindByPointGraphVisualiser from './FindByPointGraphVisualiser';
import FindByPointStratUnitInfo from './FindByPointStratUnitInfo';
import Button from "react-bootstrap/Button";


export default class FindByPointResults extends Component {
  constructor(props) {
    super(props)
    var graphData = { "nodes": [], "links": [] };

    this.state = {
      locations: this.props.locations,
      hideMe: false,
      orig_locations: {},
      withins_lookup: {},
      isLoading: false,
      latlng: this.props.latlng,
      contextLocationLookups: {},
      currGeom: undefined,
      jobqueue: {},
      arrDivs: [],
      updateResultList: false,
      usefilteredLocations: false,
      findByLocationError: false
    }
    this.updateLocations = this.updateLocations.bind(this);
  }

  componentDidMount() {
    this.setState({
      contextLocationLookups: {},
      hideMe: this.props.hideMe
    });
  }


  componentDidUpdate() {
    if(this.props.hideMe != this.state.hideMe) {
      this.setState({
        hideMe: this.props.hideMe
      });
    }

    if (this.props.latlng != this.state.latlng) {
      this.setState({
        latlng: this.props.latlng,
        contextLocationLookups: {},
        jobqueue: {},
      });
      
    }

    if (this.props.locations != this.state.locations && typeof this.props.locations !== 'undefined') {

      this.setState({
        locations: this.props.locations,
        orig_locations: this.props.locations
      });         
      //check if errorMessage
      if(this.props.locations == 'errorMessage') {
        var arrDivs = this.updateArrDivs(this.props.locations);
        this.setState({
          arrDivs: arrDivs
        });
      }
      else {
        var arrDivs = this.updateArrDivs(this.props.locations);
        this.setState({
          arrDivs: arrDivs
        })
      }    
      
    }    
 
   
  }

  
  updateLocations() {
    console.log("updateLocations")
    this.setState({
      locations: this.props.locations
    })
  }

 

  callbackFunction = (uri, relation, data, jobid) => {
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

    this.removeJobFromQueue(jobid);
    this.setState({
      contextLocationLookups: curr
    })
  }



  errorCallback = (errMessage, jobid) => {
    console.log(errMessage);
    this.removeJobFromQueue(jobid);
  }

  viewFeatureCallback = (e, item_uri) => {
    console.log("Search result clicked: " + item_uri); 
    this.props.renderResultSummaryFn(item_uri)
  }

  

  updateArrDivs = (locations) => {
    var arrDivs = [];
    var here = this;
    //change this to iterate through a list rather than a location dict obj
    
    if(locations && locations != 'errorMessage') {
      //this.state.locations['res'].forEach(function(item, index) {
      //  console.log(item);
      //});

      //<Button variant="outline-primary" size="sm" onClick={(e) => here.viewFeatureCallback(e, item['feature'])}>View feature</Button>
      
      locations.forEach(function(item, index) {        
        arrDivs.push( (
          <div className="mainPageResultListItem" key={index}>
            <div>
                Dataset: {item['dataset']}
                <FindByPointStratUnitInfo featureSet={item['feature']} displayFeatureFn={here.viewFeatureCallback}/>
                </div>
                <div>
                <Button variant="outline-primary" size="sm" onClick={(e) => here.handleViewGeomClick(e, here.convertLocalGds(item['geometry']))}>
                  View area
                </Button>                
                <Button variant="outline-primary" size="sm" href={here.convertLocalGds(item['geometry'])} target="gds">
                    View in GDS
                </Button>              
            </div>
          </div>
        ));
     
      });        
    }
    else {
      arrDivs.push( (
        <div className="mainPageResultError">Error: Find By Location API encountered an unexpected error. Please try again later.</div>));
      here.setState({
          findByLocationError: true
      });
    }
    return arrDivs;
  }

  convertLocalGds = (gds_url) => {    
    //return gds_url.replace("http://gds:3000/", "http://localhost:3000/")
    const from_prefix = process.env.REACT_APP_GDS_FROM_URL_PREFIX;
    const to_prefix = process.env.REACT_APP_GDS_TO_URL_PREFIX;
    return gds_url.replace(from_prefix, to_prefix);
  }
 

  handleViewGeomClick(e, geom_uri) {
    console.log('this is:', e);
    console.log('geometry uri:', geom_uri);
    //this.setState({
    //  currGeom: geom_uri
    //});

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


  render() {
    

    var fn = this.renderWithins;
    var contextLocationLookups = this.state.contextLocationLookups;
    console.log(contextLocationLookups);
    var message = (<div></div>)
    if (this.state.locations && Object.keys(this.state.locations).length > 0) {
      message = (<div><h3>Results</h3></div>)
    }

    var pointMessage = (<p></p>)
    if (this.state.latlng) {
      pointMessage = (<p>Point selected on map: {this.state.latlng}</p>)
    }

    var gd = this.state.graphData;
    console.log(gd);

    var arrDivs = this.state.arrDivs;
  
     var validArrDivsOrBlank = (arrDivs.length > 0) ?
      (
        <div>
            {arrDivs}
            </div>        
      )
      :
      <div></div>;
    console.log(this.state.jobqueue);

    return ( 
      !this.state.hideMe && 
      <div className="h-100" >
        <Row>
          <Col sm={12} className="fullheight-results">

            {message}

            {pointMessage}

            {validArrDivsOrBlank}

          </Col>
        </Row>
      </div>
    )
  }
}