

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
    document.getElementById("line_controls").appendChild(div);

    /* age slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_age_slider");
    div.className="param_slider";
    document.getElementById(lineid).appendChild(div);
    
    /* metallicity slider */
    var div = document.createElement("div");
    div.id=lineid.concat("_Z_slider");
    div.className="param_slider";
    document.getElementById(lineid).appendChild(div);
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
