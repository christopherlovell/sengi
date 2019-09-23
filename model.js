var files;
files = ['wavelength.txt','components.txt']

async function main(){

    try {

        let [wavelength, components, mean, coeffs] = await Promise.all([
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
        ]);
   
        // for some reason split is adding an extra element at the end of arrays
        // for now, just pop it:
        wavelength.pop();
        components.pop();
        mean.pop();
        coeffs.pop();

        var i = 0;
        dotp = math.multiply(coeffs[i], components)
        spec = math.add(mean, dotp)
        

        // ----- D3 plot
        var margin = {top: 10, right: 30, bottom: 30, left: 60},
            width = 460 - margin.left - margin.right,
            height = 400 - margin.top - margin.bottom;


        // append the svg object to the body of the page
        var svg = d3.select("#my_dataviz")
          .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
          .append("g")
            .attr("transform",
                  "translate(" + margin.left + "," + margin.top + ")");

	
		// --- create plotting data format	
        var data=[]; 
        for(var i=0; i<wavelength.length; i++){
        	var obj = {wl: wavelength[i], sp: spec[i]};
	        data.push(obj);
        }

		var x = d3.scaleLinear()
			.domain(d3.extent(data, function(d) { return d.wl; }))
		    .range([0,width]);

		var y = d3.scaleLinear()
			.domain([d3.min(data, function(d) { return d.sp; }), 
                     d3.max(data, function(d) { return +d.sp; })])
		    .range([height,0]);

		
		svg.append("g")
	      .attr("transform", "translate(0," + height + ")")
    	  .call(d3.axisBottom(x));

		svg.append("g")
    	  .call(d3.axisLeft(y));

		svg.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", "steelblue")
          .attr("stroke-width", 1.5)
          .attr("d", d3.line()
            .x(function(d) { return x(d.wl) })
            .y(function(d) { return y(d.sp) })
            )
        

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

main();
