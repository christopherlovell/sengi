
function reconstruct(age,Z,ages,metallicities,coeffs,components,mean){
    n_coeffs = coeffs[0].length;

    interp_coeffs = new Array(n_coeffs)
    for (k=0; k<n_coeffs; k++){
        c_col = coeffs.map(x => x[k]);
        //interp_coeffs[k] = nearest_grid_point(age,Z,ages,metallicities,c_col)
        interp_coeffs[k] = interpolate_2d(age,Z,ages,metallicities,c_col)
    }

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


function nearest_idx(arr,val){
    diff = math.subtract(arr,val)
    abs_diff = math.abs(diff)

    // get indexes of negative values
    negative_idx = math.subtract(arr,val).map((c,i) => c < 0 ? i : undefined).filter(c => c !== undefined)
    positive_idx = math.subtract(arr,val).map((c,i) => c > 0 ? i : undefined).filter(c => c !== undefined)

    // get index of closest negative val
    lo_idx = negative_idx.reduce((imin,c,i,arr) => abs_diff[c] < abs_diff[imin] ? c : imin, negative_idx[0])
    hi_idx = positive_idx.reduce((imin,c,i,arr) => abs_diff[c] < abs_diff[imin] ? c : imin, positive_idx[0])

    // find distance
    dist = math.abs(val - arr[hi_idx]) / math.abs(arr[lo_idx] - arr[hi_idx])

    return [lo_idx,hi_idx,dist]
}

function interpolate_2d(x,y,x_arr,y_arr,z_arr){
    // bilinear interpolation
    temp = nearest_idx(x_arr,x);
    x_lo_idx = temp[0];
    x_hi_idx = temp[1];
    x_dist = temp[2];
    
    temp = nearest_idx(y_arr,y);
    y_lo_idx = temp[0];
    y_hi_idx = temp[1];
    y_dist = temp[2];

    c1 = fetch_coeff(x_lo_idx, y_lo_idx, y_arr.length,z_arr);
    c2 = fetch_coeff(x_lo_idx, y_hi_idx, y_arr.length,z_arr);
    c3 = fetch_coeff(x_hi_idx, y_lo_idx, y_arr.length,z_arr);
    c4 = fetch_coeff(x_hi_idx, y_hi_idx, y_arr.length,z_arr);

    c_y_lo = c1*x_dist + c3*(1-x_dist);
    c_y_hi = c2*x_dist + c4*(1-x_dist);

    return y_dist*c_y_lo + (1-y_dist)*c_y_hi
}


function argMin(a){
    return a.reduce((iMin, x, i, arr) => x < arr[iMin] ? i : iMin, 0);
}


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

