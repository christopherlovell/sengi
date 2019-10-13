
function reconstruct(age,Z,ages,metallicities,coeffs,components,mean){
    n_coeffs = coeffs[0].length;

    interp_coeffs = new Array(n_coeffs)
    for (k=0; k<n_coeffs; k++){
        c_col = coeffs.map(x => x[k]);
        interp_coeffs[k] = nearest_grid_point(age,Z,ages,metallicities,c_col)
    }

    //console.log(interp_coeffs);

    dotp = math.multiply(interp_coeffs, components);
    spec = math.add(mean, dotp);

    return spec;
}


function fetch_coeff(x_idx,y_idx,y_len,z_arr){
    return z_arr[x_idx + y_idx*y_len];
}


function nearest_grid_point(x,y,x_arr,y_arr,z_arr){
    x_idx = argMin(math.abs(math.subtract(x_arr, x)))
    y_idx = argMin(math.abs(math.subtract(y_arr, y)))

    return fetch_coeff(x_idx,y_idx,y_arr.length,z_arr);
}


function argMin(a){
    return a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
}


//function argMax(a){
//    return a.reduce((iMax, x, i, arr) => x > arr[iMin] ? i : iMax, 0);
//}

//function linear_interpolation(x,y,x_arr,y_arr,z_arr){
//    x_min_idx = argMin(math.abs(math.subtract(x_arr, x)))
//    x_max_idx = argMax(math.abs(math.subtract(x_arr, x)))
//    
//    y_min_idx = argMin(math.abs(math.subtract(y_arr, y)))
//    y_max_idx = argMax(math.abs(math.subtract(y_arr, y)))
//
//    z_idx = x_idx + y_idx*y_arr.length;
//    
//    return z_arr[z_idx];
//}


/* kriging */

//tl = c_col.length;
//al = ages.length;
//zl = metallicities.length;
//console.log(c_col);

//x_col = Array(tl);
//y_col = Array(tl);

//for(i=0; i < c_col.length; i++){
//    x_col[i] = ages[i % al];
//    y_col[i] = metallicities[Math.floor(i / zl)];
//}

//console.log(x_col,y_col);

/* kriging.js example */
//n = 580;  // fails for large array sizes
//var model = "spherical";//"exponential";
//var sigma2 = 0, alpha = 0.1;
//var variogram = kriging.train(c_col.slice(0,n), x_col.slice(0,n), y_col.slice(0,n), model, sigma2, alpha);
//var xnew = 0.011;
//var ynew = -0.648;
//var tpredicted = kriging.predict(xnew, ynew, variogram);
//console.log(tpredicted);
//console.log(coeffs[0][0]);

