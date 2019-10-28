
function render(data){

    console.log("here");
    temp = get_data_extent(data);
    yMin = temp[2];
    yMax = temp[3];

    yScale.domain([yMin,yMax]);
    //xScale.domain([xMin,xMax]);
    
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);
    
    // draw the new axis
    if (svg.selectAll(".y.axis").empty()){
        yAx = svg.append("g")
            .attr("class","y axis")
            .call(yAxis);
    } else {
        yAx = svg.selectAll(".y.axis")
          .transition().duration(1500)
          .call(yAxis);
    };

    if (svg.selectAll(".x.axis").empty()){
        xAx = svg.append("g")
            .attr("transform","translate(0," + height + ")")
            .attr("class","x axis")
            .call(xAxis);
    }

    // Add brushing
    var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);            // Each time the brush selection changes, trigger the 'updateChart' function

    if (svg.selectAll(".brush").empty()){
        d3.select("#context")
          .append("g")
          .attr("class","brush")
          .call(brush)
    }

    // draw new lines
    var lines = svg.selectAll(".line")
        .data(data)
        .attr("class","line")

    lines.exit().remove();

    lines.enter()
      // add line
      .append("path")
        .attr("class", "line")
        .attr("clip-path", "url(#clip)")
        .attr("d", line)
        .style("stroke", function(d,i){ return color(i) })
      // Update new data
      .merge(lines)
        .transition().duration(duration)
        .attr("d", line)
        .style("stroke", function(d,i){ return color(i) });

    // on double click, reinitialize the chart
    svg.on("dblclick",function(){

      temp = get_data_extent(data);
      var xMin = temp[0];
      var xMax = temp[1];
      console.log(xScale.domain());
      xScale.domain([xMin,xMax]);
      console.log(xScale.domain());

      xAx.transition().duration(1000).call(xAxis);

      lines.enter()
      //  .merge(lines)
        .selectAll('path.line')
        .transition().duration(duration)
        .attr("d", line)
        .style("stroke", function(d,i){ return color(i) });

    });
    
    // wait before resetting
    var idleTimeout;
    function idled() { idleTimeout = null; }

    // A function that updates the chart for given boundaries
    function updateChart() {

      // What are the selected boundaries?
      extent = d3.event.selection;

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        //xScale.domain([ 4,8])
      }else{
        xScale.domain([ xScale.invert(extent[0]), xScale.invert(extent[1]) ]);
        d3.selectAll(".brush")
            .call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAx.transition().duration(1000).call(xAxis)
      lines.enter()
          .selectAll('path.line')
          .transition()
          .duration(1000)
          .attr("d", line)
          .style("stroke", function(d,i){ return color(i)});
    }

    // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 30) + ")")
        .style("text-anchor", "middle")
        .text("Wavelength (Angstroms)");

    // text label for the y axis
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x",0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .text("Flux");

}

function get_data_extent(data) {

    /* Get min/max in x and y axis */
    var yMin = d3.min(data, function(arr){
       return d3.min(arr, function(ar){return ar.y});
    });
    
    var yMax = d3.max(data, function(arr){
       return d3.max(arr, function(ar){return ar.y});
    });
   
    var xMin = d3.min(data, function(arr){
       return d3.min(arr, function(ar){return ar.x});
    });
    
    var xMax = d3.max(data, function(arr){
       return d3.max(arr, function(ar){return ar.x});
    });
    
    return [xMin,xMax,yMin,yMax];
}
