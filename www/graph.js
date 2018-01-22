function range(start, stop, step){
  var a=[start], b=start;
  while(b<stop){b+=step;a.push(b)}
  return a;
};

var margin = {top: 70, right:20, bottom: 20, left: 20},
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
    .force("center", d3.forceCenter((width + margin.left + margin.right) / 2, (height + margin.bottom) / 2));

var svg = d3.select('#div_graph')
  .append('svg')
    .attr('id', 'svg_graph')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
      .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')
      .attr('id', 'g_graph');

var legend_width = Math.min(width,600);

  if(legend_width < 600){
    var legend_trans = margin.left;
  } else{
    var legend_trans = margin.left + ((width-600) / 2) ;
  }

var legend = d3.select('#svg_graph')
  .append('g')
    .attr('transform', 'translate(' + legend_trans + ',' + 20 + ')')
    .attr('id', 'g_legend');

var legend_axis = d3.scaleLinear()
  .domain([1,24])
	.range([0,legend_width]);

//gradient defs
var svg_proper = d3.select('#svg_graph')

var grain_defs  = svg_proper.append("defs").attr('id', 'grain_defs');
var hop_defs  = svg_proper.append("defs").attr('id', 'hop_defs');
var yeast_defs  = svg_proper.append("defs").attr('id', 'yeast_defs');

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

    //legend variables
    var circle_y = 15,
        circle_r = 8,
        text_y = 33,
        text_sz = 9
        header_sz = 12
        legend_fill = 'white';

    //grain legend
    legend.selectAll("legend_circle")
      .data(range(1,11,1)).enter()
      .append("circle")
        .attr('class', 'legend_circle')
        .attr('cx', function(d) { return legend_axis(d);})
        .attr('cy', circle_y)
        .attr('r', circle_r)
        .attr("fill", function(d,i) { return "url(#g-gradient-radial-" + (i+1) + ")";});

      var grain_json = {"x" : range(1,11,1), "value" : ["2","3","5","11","22","30","60","65","200","350","600"]}

    legend.selectAll("legend_text")
      .data(grain_json.x).enter()
      .append("text")
        .attr('class', 'legend_text')
        .attr('x', function(d,i) {return legend_axis(d);})
        .attr('y', text_y)
        .attr('font-size', text_sz)
        .attr('fill', legend_fill)
        .attr('text-anchor', 'middle')
        .text(function(d,i){return grain_json.value[i];});

    legend.append("text")
      .attr('class', 'legend_header')
      .attr('x', legend_axis(6))
      .attr('y', 0)
      .attr('font-size', header_sz)
      .attr('font-weight', 'bold')
      .attr('fill', legend_fill)
      .attr('text-anchor', 'middle')
      .text('Grains (SRM Value)');

    //yeast legend
    legend.append("circle")
        .attr('class', 'legend_circle')
        .attr('cx', legend_axis(15))
        .attr('cy', circle_y)
        .attr('r', circle_r)
        .attr('fill', "url(#yeast-gradient)");

    legend.append("text")
      .attr('class', 'legend_text')
      .attr('x', legend_axis(15))
      .attr('y', text_y)
      .attr('font-size', text_sz)
      .attr('fill', legend_fill)
      .attr('text-anchor', 'middle')
      .text('All');

    legend.append("text")
      .attr('class', 'legend_header')
      .attr('x', legend_axis(15))
      .attr('y', 0)
      .attr('font-size', header_sz)
      .attr('font-weight', 'bold')
      .attr('fill', legend_fill)
      .attr('text-anchor', 'middle')
      .text('Yeast');

    //hops legend
    legend.selectAll("legend_circle")
      .data(range(19,24,1))
      .enter().append("circle")
        .attr('class', 'legend_circle')
        .attr('cx', function(d) {return legend_axis(d);})
        .attr('cy', circle_y)
        .attr('r', circle_r)
        .attr('fill', function(d,i) {return "url(#h-gradient-radial-" + (i+1) + ")";});

    var hops_json = {"x" : range(19,24,1), "value" : ["2-5","5-8","8-10","10-13","13-15","15-20"]}

    legend.selectAll("legend_text")
      .data(hops_json.x).enter()
      .append("text")
        .attr('class', 'legend_text')
        .attr('x', function(d,i) {return legend_axis(d);})
        .attr('y', text_y)
        .attr('font-size', text_sz)
        .attr('fill', legend_fill)
        .attr('text-anchor', 'middle')
        .text(function(d,i){return hops_json.value[i];});

    legend.append("text")
      .attr('class', 'legend_header')
      .attr('x', legend_axis(21.5))
      .attr('y', 0)
      .attr('font-size', header_sz)
      .attr('font-weight', 'bold')
      .attr('fill', legend_fill)
      .attr('text-anchor', 'middle')
      .text('Hops (Alpha Acid %)');

Shiny.addCustomMessageHandler("init",
  function(data){

    console.log(data);

    svg.selectAll(".lines")
      .transition()
      .duration(400)
        .style("stroke-width", 0)
        .remove();

    svg.selectAll(".circles")
      .transition()
      .duration(750)
        .attr('r', 0)
        .remove();

    var edgeCounts = [];
    data.links.forEach(function(d,i) {edgeCounts.push(d['value']);});
    var edgeRange = d3.extent(edgeCounts);
    edgeSize.domain([edgeRange[0], edgeRange[1]]);

    var nodeCounts = [];
    data.nodes.forEach(function(d,i) {nodeCounts.push(d['value']);});
    var nodeRange = d3.extent(nodeCounts);
    nodeSize.domain([nodeRange[0], nodeRange[1]]);

    var tool_tip = d3.tip()
      .attr("class", "d3-tip")
      .offset([-8, 0])
      .html(function(d,i) { return d; });

    svg.call(tool_tip);

    var link = svg.append("g")
      .attr("class", "links")
      .selectAll("line")
      .data(data.links)
      .enter().append("line")
        .attr('class', 'lines')
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
        .attr('class','circles')
        .attr("r", 0)
        .attr("r", function(d) {return nodeSize(d.value); })
        .attr("fill", function(d) { return colorPicker(d.ing_type, d.aa_group, d.srm); })
        .on('mouseover', function(d,i) {
          tool_tip.show(d.id);})
        .on('mouseout', function(d,i) {
          tool_tip.hide(d.id);})
        .call(d3.drag()
            .on("start", dragstarted)
            .on("drag", dragged)
            .on("end", dragended));


    node.append("title")
      .text(function(d) { return d.id; });

    simulation.restart();
    simulation.alpha(.5).alphaTarget(0);

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
          // .attr("cx", function(d) { return d.x; })
          // .attr("cy", function(d) { return d.y; });
        .attr("cx", function(d) { return d.x = Math.max(nodeSize(d.value), Math.min(width - nodeSize(d.value), d.x)); })
        .attr("cy", function(d) { return d.y = Math.max(nodeSize(d.value), Math.min(height - nodeSize(d.value), d.y)); });
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
