
function d3_data_transform(wavelength,spec){
    // --- create plotting data format  
    var data=[]; 
    for(var i=0; i<wavelength.length; i++){
        var obj = {x: wavelength[i], y: spec[i]};
        data.push(obj);
    }

    //return data;
    return data;
}



async function load_data(id){

    var url='https://www.christopherlovell.co.uk/speedy_sed/';

    try {
        let [wavelength,components,mean,coeffs,ages,metallicities] = await Promise.all([
            fetch(str.concat(url,"data/wavelength.txt"))
                .then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

            fetch(str.concat(url,"data/components.txt"))
                .then(x => x.text())
                .then(text => text.split(/\r?\n/).map( pair => pair.split(/\s+/).map(Number) )),

            fetch(str.concat(url,"data/mean.txt"))
                .then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

            fetch(str.concat(url,"data/coeffs.txt"))
                .then(x => x.text())
                .then(text => text.split('\n').map( pair => pair.split(/\s+/).map(Number) )),

            fetch(str.concat(url,"data/ages.txt"))
                .then(x => x.text()).then(text => text.split(/\r|\n/).map(Number)),

            fetch(str.concat(url,"data/metallicities.txt"))
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
        
        //sessionStorage.setObj(id,dict);

        return dict;
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
