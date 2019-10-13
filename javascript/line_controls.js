function toggle_visibility(id){
    var e = document.getElementById(id);
    if (e.style.display == 'block' || e.style.display=='')
    {
        e.style.display = 'none';
    }
    else 
    {
        e.style.display = 'block';
    }
}


function get_slider_values(lineid){

    var age = parseFloat(document.getElementById(lineid.concat("_age_slider"))
            .noUiSlider.get());

    var Z = parseFloat(document.getElementById(lineid.concat("_Z_slider"))
            .noUiSlider.get());
    
    return [age, Z];
}


function add_line_controls(lineid){
    /* lineid: name of line */

    var div = document.createElement("div");
    div.id = lineid;
    div.className="container"
    document.getElementById("line_controls").appendChild(div);

    // add horizontal line
    var hr = document.createElement('hr');
    div.appendChild(hr);
    
    /* header row */
    var row_div = document.createElement("div");
    row_div.className="row"
    document.getElementById(lineid).appendChild(row_div);

    // add text
    var child_div = document.createElement("div");
    child_div.className="eleven columns"
    var content = document.createTextNode("Line ".concat(Number(lineid.substr(9))+1));
    child_div.appendChild(content)
    row_div.appendChild(child_div);

    // add button
    var child_div = document.createElement("div");
    child_div.className="one column"
    var but = document.createElement("div");
    but.id=lineid.concat("_toggle_button");
    but.className="arrow-down";
    child_div.appendChild(but)
    row_div.appendChild(child_div);
    
    /* labels row */
    var row_div = document.createElement("div");
    row_div.className="row"
    document.getElementById(lineid).appendChild(row_div);
    
    var child_div = document.createElement("div");
    child_div.className="six columns"
    child_div.append(document.createTextNode("Age"));
    row_div.appendChild(child_div);
    
    var child_div = document.createElement("div");
    child_div.className="six columns"
    child_div.append(document.createTextNode("Metallicity"));
    row_div.appendChild(child_div);

    /* slider row */
    var row_div = document.createElement("div");
    row_div.className="row"

    /* age slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_age_slider");
    div.className="param_slider";
    var col_div = document.createElement("div");
    col_div.className="row"
    col_div.className="six columns";
    col_div.appendChild(div)
    row_div.appendChild(col_div);
    
    /* metallicity slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_Z_slider");
    div.className="param_slider";
    var col_div = document.createElement("div");
    col_div.className="row"
    col_div.className="six columns";
    col_div.appendChild(div)
    row_div.appendChild(col_div);
    
    document.getElementById(lineid).appendChild(row_div);

    document.getElementById(lineid.concat("_toggle_button"))
        .addEventListener("click", function(){
            document.getElementById(lineid.concat("_toggle_button")).classList.toggle('active')
            toggle_visibility(lineid.concat("_age_slider"));
            toggle_visibility(lineid.concat("_Z_slider"));
        });
}


function init_param_slider(lineid,div_extension,arr){

    div_name = lineid.concat(div_extension);
    var div = document.getElementById(div_name);

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

    div.noUiSlider.on("change", function(){main(lineid,false)});
}


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


//    // ---- init drop down selectors
//    if (first){
//        //init_param_selector("#age_container",ages,'age_select');
//        //init_param_selector("#Z_container",metallicities,'Z_select');
//        init_param_slider("#age_slider",ages);
//        init_param_slider("#Z_slider",metallicities);
//    }

    //var e = document.getElementById("age_select");
    //var i = e.selectedIndex;

    //var e = document.getElementById("Z_select");
    //var j = e.selectedIndex;
