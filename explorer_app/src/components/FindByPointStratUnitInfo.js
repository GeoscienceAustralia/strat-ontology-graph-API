import React, {
    Component
  } from 'react'
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";  
import FindByPointStratUnitInfoStratnames from "./FindByPointStratUnitInfoStratnames";
const STRATNAMES_API_ENDPOINT = process.env.REACT_APP_STRATNAMES_API_ENDPOINT;
const controller = new AbortController();
const { signal } = controller;
class FindByPointStratUnitInfo extends Component {
    constructor(props) {
      super(props);
      this.state = {
        isFetching: false,
        provinceResourcedata: {},
        provinceStratunitDataIdx: {},
        provinceUri: null,
        cancelAllFetches: false
      };
    }
    componentDidMount() {
      var featureUri = null;
      if(this.props.featureSet.length > 0) {
          //take the first one
          featureUri = this.props.featureSet[0];
      }
      if(featureUri != null) {
          this.handleFetchProvinceData(featureUri);
      }        
    };
    componentWillUnmount() {
      if(this.state.isFetching) {
        //controller.abort();
      }
      //controller.abort();
    };
    handleCancelFetches() {

    };
    handleFetchProvinceData(provinceUri) {   
        var ctx = this;
        this.fetchResource(provinceUri, function(result) {
          ctx.setState({
            provinceResourcedata: result
          });
        });

        
        this.fetchProvinceStratnames(provinceUri, function(result){
          const stratnameUriList = result['results'];
          var curridx = {}
          stratnameUriList.forEach(function (item, index) {
            //get resource info for each
            //ctx.fetchResource(item, function(result) {
            //  var currIdx = ctx.state.provinceStratunitDataIdx;
            //  currIdx[item] = result;
            //  ctx.setState({provinceStratunitDataIdx: currIdx});
            //});
            curridx[item['uri']] = item['label']
          });
          ctx.setState({provinceStratunitDataIdx: curridx});
        }); 
        
    }


    render() { 
        var label = '';
        const provinceData = this.state.provinceResourcedata;
        const provinceStratunitDataIdx = this.state.provinceStratunitDataIdx;
        if ('http://purl.org/dc/terms/identifier' in provinceData) {
          label = provinceData['http://purl.org/dc/terms/identifier'];
        }
        return (
          <div className="h-100" >
            <Row>
              <Col sm={12} className="fullheight-results-province-stratunit"> 
                <p>dc:identifier: {label}</p>
                <FindByPointStratUnitInfoStratnames provinceStratunitDataIdx={provinceStratunitDataIdx}/>
              </Col>              
            </Row>
          </div>
        )
    };
    
        
    
    
    fetchStratResourceWithFetchAPI = (resourceUri, callback) => {
        this.setState({...this.state, isFetching: true});
        const API_ENDPOINT_URL = STRATNAMES_API_ENDPOINT + "/resource?uri=" +   encodeURIComponent(resourceUri)
        fetch(API_ENDPOINT_URL, { signal })
            .then(response => response.json())
            .then(result => {
                callback(result);
            })
            .catch(e => {
                console.log(e);
                this.setState({...this.state, isFetching: false});
            });
    };
    fetchResource = this.fetchStratResourceWithFetchAPI;

    fetchProvinceStratnamesWithFetchAPI = (provinceUri, callback) => {
      this.setState({...this.state, isFetching: true});
      const API_ENDPOINT_URL = STRATNAMES_API_ENDPOINT + "/stratunit/province?uri=" +   encodeURIComponent(provinceUri);
      fetch(API_ENDPOINT_URL, { signal })
          .then(response => response.json())
          .then(result => {
             callback(result);
          })
          .catch(e => {
              console.log(e);
              this.setState({...this.state, isFetching: false});
          });
    };
    fetchProvinceStratnames = this.fetchProvinceStratnamesWithFetchAPI;

  }
  export default FindByPointStratUnitInfo