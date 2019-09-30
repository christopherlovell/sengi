
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


var color = 'steelblue';
var duration = 1000;

async function main(lineid,first){
    
    load_data(lineid)
      .then((dict) => {

        if (first){
            init_param_slider(lineid,"_age_slider",dict["ages"]);
            init_param_slider(lineid,"_Z_slider",dict["metallicities"]);
        }

        lines = document.getElementById('line_controls').childNodes;
        
        var data = [];

        for (var l = 0; l < lines.length; ++l) {
            line_id = lines[l].id;
            console.log(line_id);

            dict = sessionStorage.getObj(line_id);
            slider_vals = get_slider_values(line_id);
            
            spec = reconstruct(slider_vals[0],slider_vals[1],
                               dict["ages"],dict["metallicities"],
                               dict["coeffs"],dict["components"],dict["mean"]);

            data.push(d3_data_transform(dict["wavelength"],spec));
        }

        render(data); 
    });
}


// **** Add initial line
linef = "test_data"
lid = 0;
add_line_controls(linef.concat(lid));
main(linef.concat(lid),true);

document.getElementById('add_line').addEventListener("click", function() {
                                                              lid += 1;
                                                              add_line_controls(linef.concat(lid));
                                                              main(linef.concat(lid),true);
                                                            });

