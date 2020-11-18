import React, { createRef, useState, Component } from 'react'
import * as d3 from 'd3'

import {    
    Link    
  } from "react-router-dom";

 
export default class FindByPointGraphVisualiser extends Component {
  constructor(props) {
    super(props);
    this.state = {
      graphData: this.props.graphData,
      callback: this.props.callback,
    }
  }
  
  componentDidMount() {
  }
  componentDidUpdate(){
    if(this.state.graphData != this.props.graphData) {
      this.setState({
        graphData: this.props.graphData
      });
      d3.selectAll(".graphcontainer svg > *").remove();
      d3.selectAll(".graphcontainer .graphtooltip").remove();
      this.updateGraph2(this.props.graphData);
    }

  }

  updateGraph2(data) {
    const width = 640,
    height = 600;

    //Initializing chart
    //d3.select('.chart').html(null);
    //const chart = d3.select('.chart')
    const chart = d3.select(this.refs.thechart)
    .attr('width', width)
    .attr('height', height)
    ;        

    //add encompassing group for the zoom 
    var g = chart.append("g")
    .attr("class", "everything");

    chart.call(d3.zoom().on("zoom", function () {
      g.attr("transform", d3.event.transform)
    }))
    .on("dblclick.zoom", null);

    var colors = d3.scaleOrdinal(d3.schemeCategory10);
    //Initializing force simulation
    
    const simulation =     d3.forceSimulation()
        .force("link", d3.forceLink().id(function (d) {return d.name;}).distance(500).strength(0.5))
        //.force("charge", d3.forceManyBody())
        .force("center", d3.forceCenter(width / 3, height / 2));
    
    /* const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d =>         
          d.name)
        .distance(500))
        .force('charge', d3.forceManyBody().strength(1))
        //.force('charge', d3.forceManyBody())
        //.force('collide', d3.forceCollide().radius(d => d.r ))
        .force('collision', d3.forceCollide().radius(function(d) {
          return d.radius
        }))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
        */
    const dragstarted = (d) => {
      if (!d3.event.active) simulation.alphaTarget(0.3).restart()
      d.fx = d.x;
      d.fy = d.y;
  }

  const dragged = (d) => {
      d.fx = d3.event.x;
      d.fy = d3.event.y;
  }

    
    g.append('defs').append('marker')
        .append('svg:path')
        .attr('d', 'M 0,-5 L 10 ,0 L 0,5')
        .attr('fill', '#999')
        .style('stroke','none');

    var links = data.links;
    var nodes = data.nodes;
    
    var link = g.selectAll(".link")
            .data(links)
            .enter()
            .append("line")
            .attr("class", "link")
            .attr('marker-end','url(#arrowhead)')
				console.log(link);
        link.append("title")
            .text(function (d) {return d.label;});

        var edgepaths = g.selectAll(".edgepath")
            .data(links)
            .enter()
            .append('path')
            .attr('class', 'edgepath')
            .attr('fill-opacity', 0)
            .attr('stroke-opacity', 0)
            .attr('id', function (d, i) {return 'edgepath' + i})            
            .style("pointer-events", "none");

        var edgelabels = g.selectAll(".edgelabel")
            .data(links)
            .enter()
            .append('text')
            .style("pointer-events", "none")
            .attr('class', 'edgelabel')
            .attr('id', function (d, i) {return 'edgelabel' + i})
            .attr('font-size', 12)
            .attr('fill', '#aaa')
            ;

        edgelabels.append('textPath')
            .attr('xlink:href', function (d, i) {return '#edgepath' + i})
            .style("text-anchor", "middle")
            .style("pointer-events", "none")
            .attr("startOffset", "50%")
            .text(function (d) {return d.label});

        var node = g.selectAll(".node")
            .data(nodes)
            .enter()
            .append("g")
            .attr("class", "node")
            .call(d3.drag()
                    .on("start", dragstarted)
                    .on("drag", dragged)
                    //.on("end", dragended)
            );

        node.append("circle")
            .attr("r", function(d) {
              if(d.isRoot) {
                return 10;
              }
              return 5;
            })
            .style("fill", function (d, i) {
              if(d.isRoot) {
                return 'black';
              }
              return colors(i);
        })

        node.append("title")
            .text(function (d) {return d.id;});

        node.append("text")
            .attr("dy", -3)
            .text(function (d) {
              if(!d.isRoot) {
                return d.label;
              }
            });



            const ticked = () => {
              link
                  .attr("x1", function (d) {return d.source.x;})
                  .attr("y1", function (d) {return d.source.y;})
                  .attr("x2", function (d) {return d.target.x;})
                  .attr("y2", function (d) {return d.target.y;});
      
              node
                  .attr("transform", function (d) {
                    return "translate(" + d.x + ", " + d.y + ")";
                  });
      
              edgepaths.attr('d', function (d) {
                  return 'M ' + d.source.x + ' ' + d.source.y + ' L ' + d.target.x + ' ' + d.target.y;
              });
      
              edgelabels.attr('transform', function (d) {
                  console.log(d);
                  if (d.target.x < d.source.x) {
                      var bbox = this.getBBox();
                      console.log(bbox);
                      var rx = bbox.x + bbox.width / 2;
                      var ry = bbox.y + bbox.height / 2;
                      return 'rotate(180 ' + rx + ' ' + ry + ')';
                  }
                  else {
                      return 'rotate(0)';
                  }
              });
          }
      

        simulation
            .nodes(nodes)
            .on("tick", ticked);

        simulation.force("link")
            .links(links);

    
      //Starting simulation
      simulation.nodes(data.nodes)
        .on('tick', ticked);
      var link_force =  d3.forceLink(data.links)
        .id(function(d) { return d.name; })

      simulation.force("links",link_force)
       
    

  }



  updateGraph(data) {
    //const data = this.state.graphData;
      const width = 640,
            height = 480;
      
      //Initializing chart
      //d3.select('.chart').html(null);
      //const chart = d3.select('.chart')
      const chart = d3.select(this.refs.thechart)
        .attr('width', width)
        .attr('height', height)
        ;        
      
      //add encompassing group for the zoom 
      var g = chart.append("g")
      .attr("class", "everything");

      chart.call(d3.zoom().on("zoom", function () {
        g.attr("transform", d3.event.transform)
      }))
      .on("dblclick.zoom", null);
      

      //Creating tooltip
      const tooltip = d3.select('.graphcontainer')
        .append('div')
        .attr('class', 'graphtooltip')
        .style('opacity', 0)
        .html('Tooltip');

      const graphconsole = d3.select('.graphconsole');
      
      //Initializing force simulation
      const simulation = d3.forceSimulation()
        .force('link', d3.forceLink().id(d =>         
          d.name).distance(10))
        .force('charge', d3.forceManyBody().strength(-300))
        .force('collide', d3.forceCollide().radius(d => d.r * 10))
        .force('center', d3.forceCenter(width / 2, height / 2))
        .force("y", d3.forceY(0))
        .force("x", d3.forceX(0));
      
      
      //Drag functions
      const dragStart = d => {
        if (!d3.event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
        
      };
      
      const drag = d => {
        d.fx = d3.event.x;
        d.fy = d3.event.y;
      };
      
      const dragEnd = d => {
        if (!d3.event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
      }

      console.log (JSON.stringify(data));
      
      //Creating links
      const link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(data.links).enter()
        .append('line')
        .on('mouseover', (d,i) => {
          console.log(d.label);
          console.log(d.name);
          console.log(d3.event.pageX);
          graphconsole.html(
            function() {
              if(d.label && d.label.match(/^http[s]*:\/\//) != null) {
                return '<a target="out" href="' + d.label + '">' + d.label + "</a>";
              } 
              return d.label
            }
            );
            
          tooltip.html(
            function() {
                  return "<div class='graphtooltiptext'>" + d.label + "</div>";
               }
            )
            .style('left', (d.source.x + 20)  +'px')
            .style('top', (d.source.y + 40 )  + 'px')            
            .style('opacity', .9);
        }).on('mouseout', (d,i) => {
          tooltip.style('opacity', 0)
            .style('left', '0px')
            .style('top', '0px');
          //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location

        });
        link.append("title")
            .text(function (d) {return d.label;});
        /*
        const edgelabels = g.append('g')
          .attr('class', 'edgelabel')        
          .selectAll("text")
          .data(link)
          .append('text')
          .style("pointer-events", "none")
          .attr('class', 'edgelabel')
          .attr('id', function (d, i) {
              return 'edgelabel' + i
            })
          .attr('font-size', 10)
          .attr('fill', '#aaa')
          ;
            */
        const edgelabels = link
           .append('text')
           .style("pointer-events", "none")
           .attr('class', 'edgelabel')
           .attr('id', function (d, i) {
               return 'edgelabel' + i
             })
           .attr('font-size', "100px")
           .attr('fill', '#aaa')
           .text(function (d) {
            return d.label
            });
           
        edgelabels.append('textPath')
          .attr('xlink:href', function (d, i) {return '#edgepath' + i})
          .style("text-anchor", "middle")
          .style("pointer-events", "none")
          .attr("startOffset", "50%")
          .text(function (d) {
            return d.label
          });


      //Creating nodes
      const node =  g.append('g')
        .attr('class', 'node')
        .selectAll('circle')
        .data(data.nodes).enter(function(d){
          if(d.label == 'root') {
           d.fixed=true;
          }
        })
        .append('circle')
        .attr('r', 5)
        .attr('class', function(d){
            if(d.name == "root" || ('class' in d && d.class == "root")) {
              return 'root';
            }
            if(d.label == 'within' || ('class' in d && d.class == "within")){
              return 'within'
            }
            if(d.label == 'overlap'|| ('class' in d && d.class == "overlap")){
              return 'overlap'
            }
            if(d.label == 'contain'|| ('class' in d && d.class == "contain")){
              return 'contain'
            }

            return 'graphnode';
        })
        .call(d3.drag()
           .on('start', dragStart)
           .on('drag', drag)
           .on('end', dragEnd)
        ).on('mouseover', (d,i) => {
          console.log(d.label);
          console.log(d.name);
          console.log(d3.event.pageX);
          graphconsole.html(
            function() {
              if(d.label && d.label.match(/^http[s]*:\/\//) != null) {
                return '<a target="out" href="' + d.label + '">' + d.label + "</a>";
              } 
              return d.label
            }
            );
            
          tooltip.html(
            function() {
                  return "<div class='graphtooltiptext'>" + d.label + "</div>";
               }
            )
            //.style('left', (d.x + 20)  +'px')
            //.style('top', (d.y + 40 )  + 'px')
            .style('left', (d.x + 20)  +'px')
            .style('top', (d.y + 50)  + 'px')
            .style('opacity', .9);
        }).on('mouseout', (d,i) => {
          tooltip.style('opacity', 0)
            .style('left', '0px')
            .style('top', '0px');
          //d3.select("#t" + d.x + "-" + d.y + "-" + i).remove();  // Remove text location

        }).on('dblclick',d => {
          d3.event.preventDefault();
          console.log("Double click");
          console.log(d);

          if(d.label.match(/^http[s]*:\/\//) != null) {
            if(this.state.callback) {
              this.state.callback(d.label);
            }  
          }
        });
      
      //Setting location when ticked
      const ticked = () => {
        link
          .attr("x1", d => { 
            if(d.label == 'root') {
              d.x = width / 2;
              d.y = height /2;
              return d.x;
            }
            return d.source.x; 
          })
          .attr("y1", d => { 
            if(d.label == 'root') {
              d.x = width / 2;
              d.y = height /2;
              return d.y;
            }
            
            return d.source.y; 

          })
          .attr("x2", d => { 
            if(d.label == 'root') {
              d.x = width / 2;
              d.y = height /2;
              return d.x;
            }
            //console.log(d);
            if(d.target && typeof d.target === 'object' && d.target !== null &&  'x' in d.target) {
              return d.target.x; 
            }
          })
          .attr("y2", d => { 
            if(d.label == 'root') {
              d.x = width / 2;
              d.y = height /2;
              return d.y;
            } 
            //console.log(d);
            if(d.target && typeof d.target === 'object' && d.target !== null &&  'y' in d.target) {
              return d.target.y; 
            }
          });
        
          edgelabels.attr('transform', function (d) {
            if (d.target.x < d.source.x) {
                var bbox = this.parentNode.getBBox();

                var rx = bbox.x + bbox.width / 2;
                var ry = bbox.y + bbox.height / 2;
                return 'rotate(180 ' + rx + ' ' + ry + ')';
            }
            else {
                return 'rotate(0)';
            }
          });
        

        node
        .attr("cx", function(d) { 
          
          return d.x; 
        })
        .attr("cy", function(d) { 
          
          return d.y; 
        });
      };
      
      //Starting simulation
      simulation.nodes(data.nodes)
        .on('tick', ticked);
      var link_force =  d3.forceLink(data.links)
        .id(function(d) { return d.name; })

      simulation.force("links",link_force)
       
      
  }
  
  render() {
    
    return (
      <div className='graphcontainer'>
        <div className="graphconsole"></div>
        <div className='chartContainer'>
          <svg ref="thechart" 
          ></svg>
        </div>
      </div>
    ); 
  }
  }