

//function init_param_selector(div,arr,id){
//
//    var div = document.querySelector(div);
//
//    // remove child nodes
//    while (div.firstChild) {
//        div.removeChild(div.firstChild);
//    }
//
//    var frag = document.createDocumentFragment();
//    var select = document.createElement("select");
//    select.id=id
//
//    arr.forEach(function (item,index) {
//        select.options.add( new Option(item.toFixed(2),item) );
//    })
//    
//    frag.appendChild(select);
//    div.appendChild(frag);        
//}


function init_param_slider(div,arr,id){

    var div = document.querySelector(div);

    min_x = Number(math.min(arr).toFixed(4));
    max_x = Number(math.max(arr).toFixed(4));

    noUiSlider.create(div, {
        start: [1.0],
        connect: true,
        range: {
            'min': min_x,
            'max': max_x
        },
        format: {
            // 'to' the formatted value. Receives a number.
            to: function (value) {
                return value.toFixed(4);
            },
            // 'from' the formatted value.
            // Receives a string, should return a number.
            from: function (value) {
                return Number(value).toFixed(4);
            }
        },
        tooltips: [true],
        pips: {
            mode: 'range',
            stepped: true,
            density: 2,
            format: {
                to: function (value) { return value.toFixed(2); },
                from: function (value) { return Number(value).toFixed(4); }
            }
        }
    });

    div.noUiSlider.on("change", function(){main(false)});
}



function argMin(a){
    return a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
}
//function argMax(a){
//    return a.reduce((iMax, x, i, arr) => x > arr[iMin] ? i : iMax, 0);
//}

//function linear_interpolation(x,y,x_arr,y_arr,z_arr){
//    x_min_idx = argMin(math.abs(math.subtract(x_arr, x)))
//    x_max_idx = argMax(math.abs(math.subtract(x_arr, x)))
//    
//    y_min_idx = argMin(math.abs(math.subtract(y_arr, y)))
//    y_max_idx = argMax(math.abs(math.subtract(y_arr, y)))
//
//    z_idx = x_idx + y_idx*y_arr.length;
//    
//    return z_arr[z_idx];
//}

function fetch_coeff(x_idx,y_idx,y_len,z_arr){
    return z_arr[x_idx + y_idx*y_len];
}

function nearest_grid_point(x,y,x_arr,y_arr,z_arr){
    x_idx = argMin(math.abs(math.subtract(x_arr, x)))
    y_idx = argMin(math.abs(math.subtract(y_arr, y)))

    return fetch_coeff(x_idx,y_idx,y_arr.length,z_arr);
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

        // ---- init drop down selectors
        if (first){
            //init_param_selector("#age_container",ages,'age_select');
            //init_param_selector("#Z_container",metallicities,'Z_select');
            init_param_slider("#age_slider",ages,'age_slider');
            init_param_slider("#Z_slider",metallicities,'Z_slider');
        }

        //var e = document.getElementById("age_select");
        //var i = e.selectedIndex;
        
        //var e = document.getElementById("Z_select");
        //var j = e.selectedIndex;
        
        var new_age = parseFloat(document.getElementById("age_slider")
                .noUiSlider.get());

        var new_Z = parseFloat(document.getElementById("Z_slider")
                .noUiSlider.get());

        console.log(new_age,new_Z);

        n_coeffs = coeffs[0].length;

        interp_coeffs = new Array(n_coeffs)
        for (k=0; k<n_coeffs; k++){
            c_col = coeffs.map(x => x[k]);
            interp_coeffs[k] = nearest_grid_point(new_age,new_Z,ages,metallicities,c_col)
        }
       
        console.log(interp_coeffs);

        dotp = math.multiply(interp_coeffs, components);
        spec = math.add(mean, dotp);

        console.log(spec);
   
        var data = d3_data_transform(wavelength,spec);
        
        render(data); 

        //tl = c_col.length;
        //al = ages.length;
        //zl = metallicities.length;
        //console.log(c_col);

        //x_col = Array(tl);
        //y_col = Array(tl);

        //for(i=0; i < c_col.length; i++){
        //    x_col[i] = ages[i % al];
        //    y_col[i] = metallicities[Math.floor(i / zl)];
        //}

        //console.log(x_col,y_col);
        
        /* kriging.js example */
        //n = 580;  // fails for large array sizes
        //var model = "spherical";//"exponential";
        //var sigma2 = 0, alpha = 0.1;
        //var variogram = kriging.train(c_col.slice(0,n), x_col.slice(0,n), y_col.slice(0,n), model, sigma2, alpha);
        //var xnew = 0.011;
        //var ynew = -0.648;
        //var tpredicted = kriging.predict(xnew, ynew, variogram);
        //console.log(tpredicted);
        //console.log(coeffs[0][0]);

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

const xScale = d3.scaleLinear()
    .range([0,width]);

const yScale = d3.scaleLinear()
    .range([height,0]);

const line = d3.line()
    .x(d => xScale(d.x))
    .y(d => yScale(d.y))
    .curve(d3.curveMonotoneX);

/* plotting variables */
var color = 'steelblue';
var duration = 1000;

document.getElementById("age_container").addEventListener("change", function(){main(false)});
document.getElementById("Z_container").addEventListener("change", function(){main(false)});
            
main(true);

