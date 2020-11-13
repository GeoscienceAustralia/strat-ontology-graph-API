// @flow

import React, { createRef, useState, Component } from 'react'
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";

import SimpleLeaflet from "./SimpleLeaflet"
import FindByPointResults from "./FindByPointResults"
import SearchInputWidget from "./SearchInputWidget"
import SearchResultWidget from './SearchResultWidget';
import MainPageResultComponent from './MainPageResultComponent';

export default class FindByPointComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      latlng: null,
      locations: {},
      num_locations: 0,
      searchMode: false,
      jsonResults: {},
      findByPointMode: false,
      searchQuery: "",
      curr_location_uri: null,
      geometryGeojsonData: null
    }
    this.updateResult = this.updateResult.bind(this);

    this.testFn = (latlng) => {
      console.log("TestFN here! " + latlng);
      this.updateResult(latlng)
    };
  }
  renderlatlng(latlng) {
    return latlng.lat + ", " + latlng.lng;
  }

  updateResult(latlng) {
    // Explicitly focus the text input using the raw DOM API
    // Note: we're accessing "current" to get the DOM node
    this.setState({
      latlng: latlng,
      locations: []
    });
    console.log("State updated!")
    console.log(this.state)
    this.findByLatLng();

  }
  arrayAwareInvert(obj) {
    var res = {};
    for (var p in obj) {
      var arr = obj[p], l = arr.length;
      for (var i = 0; i < l; i++) {
        res[arr[i]] = p;
      }
    }
    return res;
  }

  formatResults(r) {
    console.log(r);

    const listLocations = this.arrayAwareInvert(r.locations);
    console.log(listLocations);

    this.setState({
      num_locations: r.meta.count,
      locations: r.results
    })
    return r;
  }

  findByLatLng() {
    console.log("find_at_location");

    var url = new URL(process.env.REACT_APP_STRATNAMES_API_ENDPOINT
      + "/location/find_at_location"),
      params = {
        loci_type: "any",
        lat: this.state.latlng.lat,
        lon: this.state.latlng.lng,
        count: 1000,
        offset: 0
      }
    Object.keys(params).forEach(key => url.searchParams.append(key, params[key]))
    console.log(url);
    fetch(url)
      .then(res => res.json())
      .then(
        (result) => {
          this.setState({
            jsonResults: result,
            queryResults: this.formatResults(result),
            geometryGeojsonData: null
          });
          console.log(result);
        },
        // Note: it's important to handle errors here
        // instead of a catch() block so that we don't swallow
        // exceptions from actual bugs in components.
        (error) => {
          this.setState({
            error
          });
        }
      )
  }
  


  performFindAtPoint = (d) => {
    this.setState({
      resultsMode: "FIND_AT_POINT",
    });
  }

  renderSelectedGeometryFn = (geojsonData) => {
    //this.setState({message: childData})
    this.setState({
      geometryGeojsonData: geojsonData
    });
  }

  renderResultSummaryFn = (uri) => {
    //this.setState({message: childData})
    this.setState({
      resultsMode: "RESULT_SUMMARY",
      curr_location_uri: uri
    });
  }

  render() {
    var ll = null;
    var numLoc = 0;
    var locations = {};

    if (this.state.latlng) {
      ll = this.state.latlng.lat.toString() + ", " + this.state.latlng.lng.toString();
      locations = this.state.locations;
      numLoc = this.state.num_locations;
    }

    var componentToLoad;
    if (this.state.resultsMode == "FIND_AT_POINT") {      
      componentToLoad = (<FindByPointResults latlng={ll} locations={locations} count={numLoc} renderSelectedGeometryFn={this.renderSelectedGeometryFn} renderResultSummaryFn={this.renderResultSummaryFn}/>)
    }
    else if (this.state.resultsMode == "RESULT_SUMMARY") {
      componentToLoad = (<MainPageResultComponent location_uri={this.state.curr_location_uri} renderSelectedGeometryFn={this.renderSelectedGeometryFn} renderResultSummaryFn={this.renderResultSummaryFn}/>)
    }
    else { //default is an empty div
      componentToLoad = (<div></div>)
    }

    return (
      <Container fluid='true'>
        <Row>
          <Col sm={6}>
            <SimpleLeaflet jsonSearchResults={this.state.jsonResults} geometryGeojson={this.state.geometryGeojsonData} inputRef={this.testFn} pointSelectCallback={this.performFindAtPoint}/>
          </Col>
          <Col sm={6}>
            <Row>
              <Col sm={12}>
                 {componentToLoad}
              </Col>
            </Row>
          </Col>
        </Row>
      </Container>
    )
  }
}