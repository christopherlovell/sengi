
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



async function load_data(id){

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

        var dict = {'wavelength': wavelength,
                    'components': components,
                    'mean': mean,
                    'coeffs': coeffs,
                    'ages': ages,
                    'metallicities': metallicities}

        sessionStorage.setObj('id',dict);
    }
    catch(err) {
       console.log(err);
    };
}


/* session storage helpers to handle arrays */
Storage.prototype.setObj = function(key, obj) {
    return this.setItem(key, JSON.stringify(obj))
}
Storage.prototype.getObj = function(key) {
    return JSON.parse(this.getItem(key))
}
