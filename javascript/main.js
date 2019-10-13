
// ---- D3 plotting initialisation
var margin = {top: 10, right: 30, bottom: 60, left: 60}

var chartDiv = document.getElementById('my_dataviz');
var width = chartDiv.clientWidth - margin.left - margin.right;
var ratio = 1.5
var height = (width / 1.5) - margin.top - margin.bottom
console.log(width,height);

// append the svg object to the body of the page
var svg = d3.select("div#my_dataviz")
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

var color = d3.scaleOrdinal(d3.schemeCategory10);
var duration = 500;


async function main(lineid,first){
    
    load_data(lineid)
        .then((dict) => {
   
            // if this is the first time the line is created, make some sliders
            if (first){
                init_param_slider(lineid,"_age_slider",dict["ages"]);
                init_param_slider(lineid,"_Z_slider",dict["metallicities"]);
            }
            
            slider_vals = get_slider_values(lineid);

            spec = reconstruct(slider_vals[0],slider_vals[1],
                           dict["ages"],dict["metallicities"],
                           dict["coeffs"],dict["components"],dict["mean"]);

            dat = d3_data_transform(dict["wavelength"],spec);
            
            // save the newly created (refreshed) line
            sessionStorage.setObj(lineid,dat);
    
            // now loop through existing lines and concatenate the data
            lines = document.getElementById('line_controls').childNodes;
            var data = [];

            for (var l = 0; l < lines.length; ++l) {
                
                line_id = lines[l].id;
                
                dat = sessionStorage.getObj(line_id);
                data.push(dat);
            }

            // render all lines together
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

