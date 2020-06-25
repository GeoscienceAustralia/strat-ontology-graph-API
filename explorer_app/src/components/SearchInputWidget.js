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
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

export default class SearchPageComponent extends Component {
  constructor(props) {
    super(props)

    this.state = {
      query: null,
      queryResults: null,
      queryTimeElapsed: null,
      searchCallbackFn: this.props.searchCallback
    }

    //this.updateResult = this.updateResult.bind(this);
    this.queryString = React.createRef();

    //this.input = React.createRef();
    this.updateQuery = this.updateQuery.bind(this);
    this.handleChange = this.handleChange.bind(this);
    this.testFn = (q) => {
      console.log("TestFN here! " + q);
    };
  }

  updateQuery() {
    console.log(this.props)
    console.log(this.refs)
    console.log(this.queryString.value)    
  }

  
  handleChange(e) {
    console.log(e)
    console.log(e.target.value)
    this.setState({
      query: e.target.value
    })
  }
  search() {
    this.props.searchCallback(this.state.query)

  }

  render() {
    var placeholderMsg = 'Search by location label, e.g. NSW'
    if(this.props.placeholderMsg) {
      placeholderMsg = this.props.placeholderMsg;
    }
    return (
      <InputGroup className="mb-3 searchbox searchbox-shadow">
        <InputGroup.Append className="searchbox-iconwrapper">
          <Button  className="border-0 searchbox-icon" onClick={() => this.search()} variant="outline-light">            
          </Button>
        </InputGroup.Append>
        <FormControl className="border-0 searchbox-maininput"
          //onChange={() => updateQuery()}
          onChange={this.handleChange}
          placeholder={placeholderMsg}
          aria-label={placeholderMsg}
          type='search'
          aria-describedby="basic-addon"
          onKeyPress={event => {
            if (event.key === "Enter") {
              console.log("search button submit detected!")
              this.search();
            }
          }}
        />
      </InputGroup>
    )
  }
}