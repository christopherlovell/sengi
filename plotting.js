function render(data){

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

    yScale.domain([yMin,yMax]);
    xScale.domain([xMin,xMax]);

    // create axis
    var yAxis = d3.axisLeft(yScale);
    var xAxis = d3.axisBottom(xScale);


    // draw the new axis
    if (svg.selectAll(".y.axis").empty()){
        svg.append("g")
            .attr("class","y axis")
            .call(yAxis);
    } else {
        svg.selectAll(".y.axis")
          .transition().duration(1500)
          .call(yAxis);
    };

    if (svg.selectAll(".x.axis").empty()){
        svg.append("g")
            .attr("transform","translate(0," + height + ")")
            .attr("class","x axis")
            .call(xAxis);
    }


    // draw new lines
    var lines = svg.selectAll(".line")
        .data(data)
    .attr("class","line");

    lines.exit().remove();

    lines.enter()
        .append("path")
          .attr("class", "line")
          .attr("d", line)
          .style("stroke", function(d,i){ return color(i)})
        // Update new data
        .merge(lines)
          .transition().duration(duration)
          .attr("d", line)
          .style("stroke", function(d,i){ return color(i)});


      // text label for the x axis
    svg.append("text")
        .attr("transform",
              "translate(" + (width/2) + " ," +
                             (height + margin.top + 20) + ")")
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

