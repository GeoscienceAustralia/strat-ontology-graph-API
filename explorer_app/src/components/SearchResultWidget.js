// @flow

import React, { createRef, useState, Component } from 'react'
import {    
  Link    
} from "react-router-dom";
import Container from "react-bootstrap/Container";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import InputGroup from "react-bootstrap/InputGroup";
import FormControl from "react-bootstrap/FormControl";
import Button from "react-bootstrap/Button";
import ButtonToolbar from "react-bootstrap/ButtonToolbar";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class SearchResultWidget extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: this.props.query,
      queryResults: null,
      queryTimeElapsed: null,
      isLoading: false
    }    
  }  

  componentDidMount() {
    this.setState({
      query: this.props.query,
      isLoading: true
    })
    this.search(this.props.query);
  }

  componentDidUpdate(){
    if(this.props.query != this.state.query) {
      this.setState({
        query: this.props.query,
        isLoading: true
      })
      this.search(this.props.query);
    }
  }

  formatResults(r) {
    console.log(r);
    this.setState({
      hitCount: r.hits.total,
      queryTimeElapsed:  r.took
    })
    return r
  }
  
  formatSummaryStat(){
    if(this.state.hitCount == null) {
      return <p/>
    }
    if(this.state.hitCount == 0) {
      return <p>No results found.</p>
    }
    var count = this.state.hitCount;
    if (count > 10 ){
      count = 10;
    }
    return <p>{this.state.hitCount} results ({this.state.queryTimeElapsed} milliseconds). Showing results 1-{count}.</p>
  }

  search(query) {
    console.log("Search query: " + query)
    //TODO: Replace the following env var with the deployed externally online version when that's ready
    //right now, it depends on an instance of the loci-integration-api deployed locally with ES 
    //and an index populated with <location, label> tuples
    fetch(process.env.REACT_APP_STRATNAMES_API_ENDPOINT + "/location/find-by-label?query=" + query)
        .then(res => res.json())
        .then(
          (result) => {
            this.setState({
              queryResults: this.formatResults(result),
              isLoading: false
            });
          },
          // Note: it's important to handle errors here
          // instead of a catch() block so that we don't swallow
          // exceptions from actual bugs in components.
          (error) => {
            this.setState({  
              isLoading: false,            
              error
            });
          }
        )
  }

  validateHandler = () => {
    console.log(this.queryString.current)
  }

  run_callback = (item) => {
    console.log("Search result clicked: " + item._source.uri); 
    this.props.renderResultSummaryFn(item._source.uri)
  }
  
  render() {
    console.log(this.state.queryResults)
    var hits = null;    
    var spinner = (<div><img src="/spinner.gif"/></div>)

    var divToDisplay;
    if(this.state.isLoading) {
      divToDisplay = spinner;
    }
    else {
      if(this.state.queryResults) {
        hits = this.state.queryResults.hits.hits.map((item,key) => (
                  <div className="search-result-block" key={item._source.label}> 
                    <div className="search-result-label">{item._source.label} &nbsp; </div>
                    <div>{item._source.uri}</div>
                    <div className="search-result-links"> 
                        <ButtonToolbar>
                          <Button variant="outline-primary" size="sm" onClick={() => this.run_callback(item)}>View</Button>                          
                        </ButtonToolbar>
                    </div>
                  </div>
                )
              );
      }
  
      divToDisplay = (<div>
               {this.formatSummaryStat()}
                {hits}         
      </div>)
    }
    return (
      <Container fluid='true'>        
        <Row>
          <Col sm={12}  className="fullheight-results-main">
                {divToDisplay}
          </Col>
        </Row>
      </Container>
    )
  }
}