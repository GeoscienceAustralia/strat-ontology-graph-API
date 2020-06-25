import React, {Component} from 'react';

class FeatureInfoItem extends Component {
    render() {
        var validMap = {};
        Object.keys(this.props.item).map((key, index) => {
            var curr = this.props.item[key];
            if (typeof curr === 'string' || curr instanceof String 
                    || typeof curr === 'number' || curr instanceof Number) {
                validMap[key] = curr;
            }
            else {
                //handle URI refs
                if('@id' in curr) {
                    if(curr["@id"].startsWith("http")) {
                        validMap[key] = (<a target='out' href={curr["@id"]}>{curr["@id"]}</a>);
                    }
                    //TODO: Handle blank node refs
                }
                else if('@value' in curr) {
                    validMap[key] = curr["@value"];
                }
            }
        });

        let content = Object.keys(validMap).map(key => {
            return (
              <div key={key}>
                {key}: {validMap[key]} 
              </div>
            );
          });
                  
        return ( <div> {content} </div> );
    }
}

export default FeatureInfoItem;