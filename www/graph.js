var margin = {top: 20, right:20, bottom: 20, left: 20},
  width = $(window).width() * .9 - margin.left - margin.right,
  height = $(window).height() * .9 - margin.top - margin.bottom

var nodeSize = d3.scaleLinear().range([5,20]);
var edgeSize = d3.scaleLinear().range([1,8]);

var hopColor = d3.scaleSequential(d3.interpolateGreens)
    .domain([-1,8]);

var grainColor = d3.scaleThreshold()
  .domain([0,3,4,6,12,23,31,61,66,201,351,601,1000])
  .range(["#ffff99","#ffff45","#ffe93e","#fed849","#ffa846","#d77f59","#94523a","#804541","#5b342f","#4c3b2b","#38302e","#31302c","#1b1a18"]);

var simulation = d3.forceSimulation()
    .force("link", d3.forceLink().id(function(d) { return d.id; }).distance(60))
    .force("charge", d3.forceManyBody().strength(-60))
    .force("center", d3.forceCenter(width / 2, height / 2));

var svg = d3.select('#div_graph')
  .append('svg')
    .attr('id', 'svg_graph')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'g_graph');

//gradient defs
var grain_defs  = svg.append("defs").attr('id', 'grain_defs');
var hop_defs  = svg.append("defs").attr('id', 'hop_defs');
var yeast_defs  = svg.append("defs").attr('id', 'yeast_defs');

var hopsRadial = hop_defs.selectAll("radialGradient")
  .data([1,2,3,4,5,6]).enter()
  .append('radialGradient')
    .attr("id", function(d,i){ return "h-gradient-radial-" + d;})
    .attr("cx", '.25')
    .attr('cy', '.25')
    .attr('r', '.65');

  hopsRadial.append("stop")
    .attr("stop-color", function(d) {return hopColor(d-2);})
    .attr("offset", "0%");
  hopsRadial.append("stop")
    .attr("stop-color", function(d) {return hopColor(d);})
    .attr("offset", "40%");
  hopsRadial.append("stop")
    .attr("stop-color", function(d) {return hopColor(d+2);})
    .attr("offset", "100%");

var grainsRadial = grain_defs.selectAll("radialGradient")
  .data([0,3,4,6,12,23,31,61,66,201,351,601,1000]).enter()
  .append('radialGradient')
    .attr("id", function(d,i){ return "g-gradient-radial-" + i;})
    .attr("cx", '.25')
    .attr('cy', '.25')
    .attr('r', '.65');

  grainsRadial.append("stop")
    .attr("stop-color", function(d,i) {return grainColor.range()[i-1];})
    .attr("offset", "0%");
  grainsRadial.append("stop")
    .attr("stop-color", function(d) {return grainColor(d);})
    .attr("offset", "40%");
  grainsRadial.append("stop")
    .attr("stop-color", function(d,i) {return grainColor.range()[i+1];})
    .attr("offset", "100%");

var yeastRadial = yeast_defs.append('radialGradient')
    .attr("id", "yeast-gradient")
    .attr("cx", '.25')
    .attr('cy', '.25')
    .attr('r', '.65');

  yeastRadial.append("stop")
      .attr("stop-color", "#80bfff")
      .attr("offset", "0%");
  yeastRadial.append("stop")
      .attr("stop-color", "#0080ff")
      .attr("offset", "40%");
  yeastRadial.append("stop")
      .attr("stop-color", "#004080")
      .attr("offset", "100%");

Shiny.addCustomMessageHandler("init",
  function(data){

    console.log(data);

    svg.selectAll(".links")
      .transition()
      .duration(750)
        .style("stroke-width", 0)
        .remove();

    svg.selectAll(".nodes")
      .transition()
      .duration(750)
        .attr("r", 0)
        .remove();

    var edgeCounts = [];
    data.links.forEach(function(d,i) {edgeCounts.push(d['value']);});
    var edgeRange = d3.extent(edgeCounts);
    edgeSize.domain([edgeRange[0], edgeRange[1]]);

    var nodeCounts = [];
    data.nodes.forEach(function(d,i) {nodeCounts.push(d['value']);});
    var nodeRange = d3.extent(nodeCounts);
    nodeSize.domain([nodeRange[0], nodeRange[1]]);

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
        .attr("stroke-width", function(d) { return edgeSize(d.value); });


    var colorPicker = function(type, aa, srm){
      if (type == 'Grain'){
        return "url(#g-gradient-radial-" + grainColor.range().indexOf(grainColor(srm)) + ")";
      } else if (type == 'Hops') {
        return "url(#h-gradient-radial-" + aa + ")";
      } else {
        return "url(#yeast-gradient)";
      }
    }

    var node = svg.append("g")
      .attr("class", "nodes")
      .selectAll("circle")
      .data(data.nodes)
      .enter().append("circle")
        .attr("r", 0)
        .attr("r", function(d) {return nodeSize(d.value); })
        .attr("fill", function(d) { return colorPicker(d.ing_type, d.aa_group, d.srm); })
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    node.append("title")
      .text(function(d) { return d.id; });

    simulation
      .nodes(data.nodes)
      .on("tick", ticked);

    simulation.force("link")
      .links(data.links);

    function ticked() {
      link
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

      node
          .attr("cx", function(d) { return d.x; })
          .attr("cy", function(d) { return d.y; });
    }

  });

  function dragstarted(d) {
  if (!d3.event.active) simulation.alphaTarget(0.3).restart();
  d.fx = d.x;
  d.fy = d.y;
}

function dragged(d) {
  d.fx = d3.event.x;
  d.fy = d3.event.y;
}

function dragended(d) {
  if (!d3.event.active) simulation.alphaTarget(0);
  d.fx = null;
  d.fy = null;
}
