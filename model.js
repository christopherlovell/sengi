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

        //console.log(wavelength);
        // console.log(components);
        // console.log(mean);
        // console.log(coeffs);

        var i = 0;
        var j = 0;
        //console.log(coeffs[i,j][0]);
        //console.log(components[0]);

        //var result = new Array(wavelength.length).fill(0)
        dotp = components.reduce(function(r,a,k){
            return a.map(function(elem){return elem*coeffs[i,j][k]}); 
        });

        //console.log(mean)
        //console.log(dotp)
        
        var spec = mean.map(function(elem,k){return elem + dotp[k]})
        console.log(spec)

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

		console.log(data);

		var x = d3.scaleLinear()
			.domain(d3.extent(data, function(d) { return d.wl; }))
		    .range([0,width]);

		console.log(x);

		var y = d3.scaleLinear()
			.domain([0, -10])//d3.max(data, function(d) { return +d.sp; })])
		    .range([height,0]);

		console.log(y)

		//x.domain(data.map(function(d) { return d.wl; }));
		//y.domain([0, d3.max(data, function(d) { return d.sp; })]);
		
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
        
        //var ctx = document.getElementById('myChart');
        //var myLineChart = new Chart(ctx, {
        //    type: 'line',
        //    data: {[20,10],
        //     //       data: [{
        //     //           x: [1,2,3,4,5], //wavelength,
        //     //           y: [2,3,4,5,6] }]//spec}]
        //     //   }]
        //    //}]
        //    //},
        //    options: {}//showLine: true}
        //});


        // mean + dot(coeffs[i,j], components)

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
