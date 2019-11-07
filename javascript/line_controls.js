function update_control_values(lineid){
   
    sps = get_sps(lineid); 
    vals = get_slider_values(lineid); 
    age = vals[0];
    met = vals[1];

    var met_text = "Metallicity: ".concat(met.toFixed(2))
    lin_age = Math.pow(10,age);

    // get precision, format accordingly
    if (lin_age >= 1.0){ var age_text = "Age (Gyr): ".concat(lin_age.toFixed(2)); }
    else if (lin_age >= 0.01) { var age_text = "Age (Myr): ".concat((lin_age * Math.pow(10,3)).toFixed(2)); }
    else { var age_text = "Age (yr): ".concat((lin_age * Math.pow(10,6)).toFixed(2)); }
    var out_text = sps.concat(" | ",met_text," | ",age_text);

    var header_children = document.getElementById(lineid.concat('_header_button')).childNodes;
    var textnode = document.createTextNode(out_text);

    k = 1 // control which child node to amend
    header_children[k].replaceChild(textnode, header_children[k].childNodes[0]);
    
}



function get_slider_values(lineid){

    var age = parseFloat(document.getElementById(lineid.concat("_age_slider"))
            .noUiSlider.get());

    var Z = parseFloat(document.getElementById(lineid.concat("_Z_slider"))
            .noUiSlider.get());
    
    return [age, Z];
}


function get_sps(lineid){
    var e = document.getElementById(lineid.concat("_sps_selector"));
    return e.options[e.selectedIndex].value;
}

function add_line_controls(lineid){
    /* lineid: name of line */

    //var div = document.getElementById(lineid);
    //if (!div) {
        var div = document.createElement("div");
        div.id = lineid;
        div.className="container"
        document.getElementById("line_controls").prepend(div);
    //}
    //else{
    //    var child = div.lastElementChild;  
    //    while (child) { 
    //        e.removeChild(child); 
    //        child = e.lastElementChild; 
    //    } 
    //}

    // add horizontal line
    var hr = document.createElement('hr');
    div.appendChild(hr);
    
    /* header row */
    var row_div = document.createElement("div");
    row_div.id = lineid.concat("_header_button");
    row_div.className="row header_button"
    document.getElementById(lineid).appendChild(row_div);

    /* coloured 'button' */
    var col_div = document.createElement("div");
    col_div.className="one column colour_circle";
    col_div.style="height: 30px;width: 30px;border-radius: 50%;"
    col_div.style.border="3px solid ".concat(color(Number(lineid.substr(9))));
    row_div.appendChild(col_div);
    
    /* header text */
    var col_div = document.createElement("div");
    col_div.className="ten columns header_text";
    col_div.append(document.createTextNode(""));
    row_div.appendChild(col_div);

    //var col_div = document.createElement("div");
    //col_div.className="three columns header_text";
    //col_div.append(document.createTextNode(""));
    //row_div.appendChild(col_div);
    //
    //var col_div = document.createElement("div");
    //col_div.className="four columns header_text";
    //col_div.append(document.createTextNode(""));
    //row_div.appendChild(col_div);
    
    /* button */
    var col_div = document.createElement("div");
    col_div.className="one column pm_button";
    col_div.id=lineid.concat("_pm_button");
    col_div.append(document.createTextNode("-"));
    row_div.appendChild(col_div);
    
    /* sliders row */
    var row_div = document.createElement("div");
    row_div.className="row sliders"
    row_div.id=lineid.concat("_param_slider")
    document.getElementById(lineid).appendChild(row_div);
    
    /* age column */
    var col_div = document.createElement("div");
    col_div.className="six columns";
    col_div.id=lineid.concat("_age_column");
    
    /* age slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_age_slider");
    div.className="param_slider";
    init_param_slider(lineid,div);
    col_div.appendChild(div);
    
    col_div.append(document.createTextNode("Age, log(Gyr)"));
    col_div.style.textAlign = "center";
    row_div.appendChild(col_div);
    
    /* metallicity column */
    var col_div = document.createElement("div");
    col_div.className="six columns";
    col_div.id=lineid.concat("_Z_column");
    
    /* metallicity slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_Z_slider");
    div.className="param_slider";
    init_param_slider(lineid,div);
    col_div.appendChild(div);
    
    col_div.append(document.createTextNode("Metallicity, log(Z / Zsolar)"));
    col_div.style.textAlign = "center";
    row_div.appendChild(col_div);

    /* sps selector */
    var dropdown = document.createElement("select");
    //dropdown.className="u-full-width";
    dropdown.className="six columns sps_select";
    dropdown.id = lineid.concat("_sps_selector");
    for (i=0; i<sps_models.length; i++) {
        var opt = document.createElement("option");
        opt.text = sps_models[i];
        opt.value = sps_models[i];
        dropdown.options.add(opt)
    }
    row_div.appendChild(dropdown);

    document.getElementById(lineid.concat("_sps_selector"))
        .addEventListener("change", function(){
            /* update sliders */

            main(lineid,false);
        });


    update_active_button(lineid,true);

    document.getElementById(lineid.concat("_header_button"))
        .addEventListener("click", function(){
            update_active_button(lineid,false);
        });
}

function init_param_slider(lineid,div){

    //div_name = lineid.concat(div_extension);
    //var div = document.getElementById(div_name);

    //var min_x = Number(math.min(arr).toFixed(1));
    //var max_x = Number(math.max(arr).toFixed(1));

    noUiSlider.create(div, {
        start: [0.0],
        connect: true,
        range: {
            'min': -1,
            'max': 1
        },
        //format: {
        //    // 'to' the formatted value. Receives a number.
        //    to: function (value) {
        //        return value.toFixed(2);
        //    },
        //    // 'from' the formatted value.
        //    // Receives a string, should return a number.
        //    from: function (value) {
        //        return Number(value).toFixed(2);
        //    }
        //},
        tooltips: [true],
        pips: {
            mode: 'count',
            //stepped: true,
            //density: 3,
            values: 6,
            //decimals: 2,
            format: {
                to: function (value) { return value.toFixed(2); },
                from: function (value) { return Number(value).toFixed(4); }
            }
        }
    });

    div.noUiSlider.on("change", function(){main(lineid,false)});
}

function update_param_slider(lineid,str,arr) {

    console.log(arr);

    var slider = document.getElementById(lineid.concat(str))
    
    var min_x = Number(math.min(arr).toFixed(1));
    var max_x = Number(math.max(arr).toFixed(1));

    console.log(min_x,max_x);
    
    slider.noUiSlider.updateOptions({
        range: {
            'min': min_x,
            'max': max_x
        }
    });
}

function update_active_button(lineid,new_line) { 

    /* deactivate all other active buttons */
    var lcs = document.getElementById('line_controls').childNodes;
    for (var l = 0; l < lcs.length; ++l) {

        // if this is the current line, skip it
        if (lcs[l].id == lineid){ 
            continue; 
        }

        // if the line is active...
        if (lcs[l].classList.contains('active')) {
            // deactivate it
            lcs[l].classList.toggle('active');        
            // make it invisible
            toggle_visibility(lcs[l].id.concat("_param_slider"));

            // change the pm button
            var textnode = document.createTextNode("+");
            node = document.getElementById(lcs[l].id.concat("_pm_button"))
            node.replaceChild(textnode, node.childNodes[0]);

        }
    }
 
    // activate current line
    thisline = document.getElementById(lineid);
    thisline.classList.toggle('active');
    
    // make it visible
    toggle_visibility(lineid.concat("_param_slider"));
    
    // change the pm button
    if (thisline.classList.contains('active')) {
        var textnode = document.createTextNode("-");
    }
    else {
        var textnode = document.createTextNode("+");
    }
    node = document.getElementById(lineid.concat("_pm_button"))
    node.replaceChild(textnode, node.childNodes[0]);
    
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
