import React, {
    Component
  } from 'react'
import Accordion from "react-bootstrap/Accordion";
import Card from "react-bootstrap/Card";  
class FindByPointStratUnitInfoStratnames extends Component {
    constructor(props) {
      super(props);
    } 
    
    render() { 
        const provinceStratunitDataIdx = this.props.provinceStratunitDataIdx;
        const keys = Object.keys(provinceStratunitDataIdx);
        var sortable = [];
        for (var stratnameUri in provinceStratunitDataIdx) {
            sortable.push([provinceStratunitDataIdx[stratnameUri], stratnameUri]);
        }        
        sortable.sort();
        /*
        <div>
          {
            Object.keys(provinceStratunitDataIdx).map((key, index) => ( 
              <p key={key}> {key}</p> 
            ))
          }
        </div>
        */
       const here = this;
       const liItems =  sortable.map((item) => ( 
       <li key={item[1]}><a href="#" onClick={(e) => here.props.displayFeatureFn(e, item[1])}>{item[0]} : {item[1]}</a></li>        
        ));
        return (
          <Accordion defaultActiveKey="0">            
            <Card>
              <Accordion.Toggle as={Card.Header} eventKey="1">
                Strat names ({keys.length})
              </Accordion.Toggle>
              <Accordion.Collapse eventKey="1">
                <Card.Body>
                <ul>
                  {liItems}
                </ul>
                </Card.Body>
              </Accordion.Collapse>
            </Card>
          </Accordion>        
        )
    }; 
        
  }
  export default FindByPointStratUnitInfoStratnames