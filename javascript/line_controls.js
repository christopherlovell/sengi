function update_control_values(lineid){
   
    vals = get_slider_values(lineid); 
    age = vals[0];
    met = vals[1];

    console.log(age,met);

    lin_age = Math.pow(10,age);

    // get precision, format accordingly
    if (lin_age >= 1.0){
        var textnode = document.createTextNode("Age (Gyr): ".concat(lin_age.toFixed(2)));
    }
    else if (lin_age >= 0.01) {
        var textnode = document.createTextNode("Age (Myr): ".concat((lin_age * Math.pow(10,3)).toFixed(2)));
    }
    else {
        var textnode = document.createTextNode("Age (yr): ".concat((lin_age * Math.pow(10,6)).toFixed(2)));
    }

    var item = document.getElementById(lineid.concat('_age_column'));
    console.log(item);
    console.log(textnode);
    item.replaceChild(textnode, item.childNodes[0]);
    
    var textnode = document.createTextNode("Metallicity [ log(Z / Zsolar) ]: ".concat(met.toFixed(2)));
    var item = document.getElementById(lineid.concat('_Z_column'));
    console.log(item);
    console.log(textnode);
    item.replaceChild(textnode, item.childNodes[0]);
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
    div.className="container active"
    document.getElementById("line_controls").prepend(div);

    // add horizontal line
    var hr = document.createElement('hr');
    div.appendChild(hr);
    
    /* header row */
    var row_div = document.createElement("div");
    row_div.id = lineid.concat("_header_button");
    row_div.className="row header_button"
    row_div.style.backgroundColor=color(Number(lineid.substr(9)));
    row_div.style.borderRadius = "25px";
    document.getElementById(lineid).appendChild(row_div);
    
    /* sliders row */
    var row_div = document.createElement("div");
    row_div.className="row sliders is-visible"
    row_div.id=lineid.concat("_param_slider")
    document.getElementById(lineid).appendChild(row_div);
    
    /* age column */
    var col_div = document.createElement("div");
    col_div.className="six columns";
    col_div.id=lineid.concat("_age_column");
    col_div.append(document.createTextNode("Age (Gyr)"));
    row_div.appendChild(col_div);
    
    /* age slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_age_slider");
    div.className="param_slider";
    col_div.appendChild(div);
    
    /* metallicity column */
    var col_div = document.createElement("div");
    col_div.className="six columns";
    col_div.id=lineid.concat("_Z_column");
    col_div.append(document.createTextNode("Metallicity (normalised by solar)"));
    row_div.appendChild(col_div);
    
    /* metallicity slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_Z_slider");
    div.className="param_slider";
    col_div.appendChild(div);
    
    update_active_button(lineid,true);

    document.getElementById(lineid.concat("_header_button"))
        .addEventListener("click", function(){
            update_active_button(lineid,false);
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
        }
    }
 
    // activate current line
    if (!new_line) {
        thisline = document.getElementById(lineid);
        thisline.classList.toggle('active');
    
        // make it visible
        toggle_visibility(lineid.concat("_param_slider"));
    }
}


function init_param_slider(lineid,div_extension,arr){

    div_name = lineid.concat(div_extension);
    var div = document.getElementById(div_name);

    var min_x = Number(math.min(arr).toFixed(1));
    var max_x = Number(math.max(arr).toFixed(1));

    noUiSlider.create(div, {
        start: [0.0],
        connect: true,
        range: {
            'min': min_x,
            'max': max_x
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
