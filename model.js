
function init_param_selector(div,arr,id){

    var div = document.querySelector(div);

    // remove child nodes
    while (div.firstChild) {
        div.removeChild(div.firstChild);
    }

    var frag = document.createDocumentFragment();
    var select = document.createElement("select");
    select.id=id

    arr.forEach(function (item,index) {
        select.options.add( new Option(item.toFixed(2),item) );
    })
    
    frag.appendChild(select);
    div.appendChild(frag);        
}



async function main(first=false){

    try {

        let [wavelength,components,mean,coeffs,ages,metallicities] = await Promise.all([
             fetch("data/wavelength.txt")
				.then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

             fetch("data/components.txt")
				.then(x => x.text())
				.then(text => text.split(/\r?\n/).map( pair => pair.split(/\s+/).map(Number) )),

             fetch("data/mean.txt")
				.then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

             fetch("data/coeffs.txt")
				.then(x => x.text())
				.then(text => text.split('\n').map( pair => pair.split(/\s+/).map(Number) )),
             
            fetch("data/ages.txt")
				.then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

            fetch("data/metallicities.txt")
				.then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),
        ])

        // for some reason split is adding an extra element at the end of arrays
        // for now, just pop it:
        wavelength.pop();
        components.pop();
        mean.pop();
        coeffs.pop();
        ages.pop();
        metallicities.pop();
       
        //console.log(ages);
        //console.log(metallicities);

        // ---- init drop down selectors
        if (first){
            init_param_selector("#age_container",ages,'age_select');
            init_param_selector("#Z_container",metallicities,'Z_select');
        }
    
        var e = document.getElementById("age_select");
        var i = e.selectedIndex;
        
        var e = document.getElementById("Z_select");
        var j = e.selectedIndex;
        
        idx = i + j*metallicities.length;

        dotp = math.multiply(coeffs[idx], components);
        spec = math.add(mean, dotp);
   
        var data = d3_data_transform(wavelength,spec);
        
        render(data); 
        
        //var t = [ /* Target variable */ ];
        //var x = [ /* X-axis coordinates */ ];
        //var y = [ /* Y-axis coordinates */ ];
        //var model = "exponential";
        //var sigma2 = 0, alpha = 100;
        //var variogram = kriging.train(t, x, y, model, sigma2, alpha);
        //var xnew, ynew /* Pair of new coordinates to predict */;
        //var tpredicted = kriging.predict(xnew, ynew, variogram);

    }
    catch(err) {
       console.log(err);
    };
}


function d3_data_transform(wavelength,spec){
	// --- create plotting data format	
    var data=[]; 
    for(var i=0; i<wavelength.length; i++){
    	var obj = {x: wavelength[i], y: spec[i]};
	    data.push(obj);
    }

    //return data;
    return new Array (data);
}



function render(data){

	xScale.domain(d3.extent(data[0], function(d) { return d.x; }));
	yScale.domain([d3.min(data[0], function(d) { return d.y; }),
                   d3.max(data[0], function(d) { return +d.y; })]);

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
          .style("stroke", color)
        // Update new data
        .merge(lines)
          .transition().duration(duration)
          .attr("d", line)
          .style("stroke", color);

}


// ---- D3 plotting init
var margin = {top: 10, right: 30, bottom: 30, left: 60},
    width = 660 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;


// append the svg object to the body of the page
var svg = d3.select("#my_dataviz")
  .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
  .append("g")
    .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");


var color = 'steelblue';
var duration = 1000;

const xScale = d3.scaleLinear()
    .range([0,width]);

const yScale = d3.scaleLinear()
    .range([height,0]);

const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

//svg.append("g")
//  .attr("class", "x axis")
//  .attr("transform", "translate(0," + height + ")")
//  .call(d3.axisBottom(x));
//
//svg.append("g")
//  .attr("class", "y axis")
//  .call(d3.axisLeft(y));


document.getElementById("age_container").addEventListener("change", function(){main(false)});
document.getElementById("Z_container").addEventListener("change", function(){main(false)});

main(true);

