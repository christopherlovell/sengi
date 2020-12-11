import numpy as np
from sklearn.decomposition import PCA, NMF
from grids.h5py_utils import load_h5py

import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1 import make_axes_locatable
from mpl_toolkits.axes_grid1.inset_locator import (inset_axes, InsetPosition,
                                                  mark_inset)
import matplotlib.gridspec as gridspec


def reconstruct(age,met,ages,metallicities,coeffs,components):
    n_coeffs = coeffs.shape[2]

    interp_coeffs = [None] * n_coeffs
    for k in np.arange(n_coeffs):
        interp_coeffs[k] = interpolate_2d(met,age,metallicities,ages,coeffs[:,:,k])

    spec = np.dot(interp_coeffs,components)
    return spec


def nearest_idx(arr,val):
    abs_diff = np.abs(arr - val)

    lo_idx,hi_idx = np.argsort(np.abs(arr-val))[:2]
    dist = np.abs(val - arr[hi_idx]) / np.abs(arr[lo_idx] - arr[hi_idx])

    return lo_idx,hi_idx,dist


def interpolate_2d(x,y,x_arr,y_arr,z_arr):
    # bilinear interpolation
    x_lo_idx,x_hi_idx,x_dist = nearest_idx(x_arr,x)
    y_lo_idx,y_hi_idx,y_dist = nearest_idx(y_arr,y)

    c1 = z_arr[x_lo_idx,y_lo_idx] 
    c2 = z_arr[x_lo_idx,y_hi_idx] 
    c3 = z_arr[x_hi_idx,y_lo_idx] 
    c4 = z_arr[x_hi_idx,y_hi_idx] 

    c_y_lo = c1*x_dist + c3*(1-x_dist);
    c_y_hi = c2*x_dist + c4*(1-x_dist);

    return y_dist*c_y_lo + (1-y_dist)*c_y_hi


name = 'fsps'
fname = 'grids/%s.h5'%name
spec = load_h5py(fname,'spec')
ages = load_h5py(fname,'ages')
Z = load_h5py(fname,'metallicities')
wl = load_h5py(fname,'wavelength')
mean = np.loadtxt('%s/mean.txt'%name)
components = np.loadtxt('%s/components.txt'%name)
coeffs = np.loadtxt('%s/coeffs.txt'%name)

ages = np.log10(ages)

wl_mask = (wl > 2e3) & (wl < 1e4)
wl = wl[wl_mask]
resolution = np.sum(wl_mask)
## comps = 20
# shape = len(Z[::2]) * len(ages[::2])

# spec_fit = spec[::2,::2,wl_mask].reshape((shape,resolution))
# 
# nmf = NMF(n_components=comps, init='nndsvdar', max_iter=int(1e4),
#           solver='mu', beta_loss='itakura-saito', verbose=True, tol=1e-6)
# 
# coeffs = nmf.fit_transform(spec_fit)
# components = nmf.components_


name = 'fsps_hires'
fname = 'grids/%s.h5'%name
spec_hires = load_h5py(fname,'spec')
ages_hires = np.log10(load_h5py(fname,'ages'))
Z_hires = load_h5py(fname,'metallicities')
# wl = load_h5py(fname,'wavelength')
# mean = np.loadtxt('%s/mean.txt'%name)
# components = np.loadtxt('%s/components.txt'%name)
# coeffs = np.loadtxt('%s/coeffs.txt'%name)
# ages = np.log10(ages)

coeffs = coeffs.reshape(len(Z),len(ages),20)
recon_spec = np.zeros((len(Z)-1,len(ages)-1,resolution))

for i,met in enumerate(Z_hires[1::2]):
    for j,a in enumerate(ages_hires[1::2]):
        recon_spec[i,j] = reconstruct(a,met,ages,Z,coeffs,components)


true_spec = spec_hires[1::2,1::2,wl_mask]

err = 2 * np.abs(recon_spec - true_spec) / \
        (true_spec + recon_spec)



## ---- Error Matrix --- ##

fig, (ax1) = plt.subplots(1,1, figsize=(5,5))

im = ax1.imshow(np.median(err,axis=2).T, aspect='auto',interpolation='none',vmin=0.)
#        extent=(0,len(Z[1::2]),0,len(ages[1::2])))

xidxs = [0,10,20,30,39]
ax1.set_xticks(xidxs)
print(Z[xidxs])
ax1.set_xticklabels(Z[xidxs].round(2))

yidxs = [0,20,40,60,78]
ax1.set_yticks(yidxs)
print(10**ages[yidxs])
ax1.set_yticklabels(['1 Myr','62 Myr','387 Myr','1.42 Gyr','12.5 Gyr'])
# ax1.set_yticklabels(['1 Myr','10 Myr','100 Myr','1 Gyr','15.8 Gyr'])

divider = make_axes_locatable(ax1)
cax = divider.append_axes('right', size='5%', pad=0.05)
cbar = fig.colorbar(im, cax=cax)#, orientation='horizontal')
cbar.ax.set_ylabel('$P_{50} (R_{i,\lambda_{\mathrm{min}}...\lambda_{\mathrm{max}}})$', 
                   rotation=270, labelpad=18, size=15)

ax1.set_ylabel('Age', size=15,labelpad=15)
ax1.set_xlabel('Metallicity [$\mathrm{log_{10}(Z \,/\, Z_{\odot})}$]', size=15, labelpad=15)

plt.show()
# fig.savefig('plots/interp_errmat.png',dpi=300,bbox_inches='tight')


print("Mean error:",np.mean(err))
print("Median error:",np.median(err))


