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

ages = np.log10(ages)

wl_mask = (wl > 2e3) & (wl < 1e4)
wl = wl[wl_mask]
resolution = np.sum(wl_mask)
comps = 20
shape = len(Z[::2]) * len(ages[::2])

spec_fit = spec[::2,::2,wl_mask].reshape((shape,resolution))

nmf = NMF(n_components=comps, init='nndsvdar', max_iter=int(5e3),
          solver='mu', beta_loss='itakura-saito', verbose=True, tol=1e-5)

coeffs = nmf.fit_transform(spec_fit)
components = nmf.components_

coeffs = coeffs.reshape(len(Z[::2]),len(ages[::2]),20)
recon_spec = np.zeros((len(Z[1::2]),len(ages[1::2]),resolution))

for i,met in enumerate(Z[1::2]):
    for j,a in enumerate(ages[1::2]):
        recon_spec[i,j] = reconstruct(a,met,ages[::2],Z[::2],coeffs,components)


true_spec = spec[1::2,1::2,wl_mask]

err = 2 * np.abs(recon_spec - true_spec) / \
        (true_spec + recon_spec)



## ---- Error Matrix --- ##

fig, (ax1) = plt.subplots(1,1, figsize=(5,5))

im = ax1.imshow(np.mean(err,axis=2).T, aspect='auto',interpolation='none',
        extent=(0,len(Z[1::2]),0,len(ages[1::2])),vmin=0.)

mult=6
amin=int((len(ages[1::2])-1) % mult / 2) + 0.5
amax=amin+ mult*int((len(ages[1::2])-1) / mult)
ticks = np.linspace(amin,amax,mult+1)
ax1.set_yticks(ticks)
ax1.set_yticklabels(["%.3f"%(10**a) for a in \
        ages[1::2][ticks.astype(int)]],rotation='vertical')


mult=6
amin=int((len(Z[1::2])-1) % mult / 2) + 0.5
amax=amin+ mult*int((len(Z[1::2])-1) / mult)
ticks = np.linspace(amin,amax,mult)
ax1.set_xticks(ticks)
ax1.set_xticklabels(["%.2f"%z for z in \
        Z[1::2][ticks.astype(int)]],rotation='horizontal')

divider = make_axes_locatable(ax1)
cax = divider.append_axes('right', size='5%', pad=0.05)
cbar = fig.colorbar(im, cax=cax)#, orientation='horizontal')
cbar.ax.set_ylabel('$R_{\mathrm{SMAPE}}$', rotation=270, labelpad=18, size=15)

ax1.set_ylabel('Age (Gyr)', size=15,labelpad=15)
ax1.set_xlabel('Metallicity [$\mathrm{log_{10}(Z \,/\, Z_{\odot})}$]', size=15, labelpad=15)

plt.show()
fig.savefig('plots/interp_errmat.png',dpi=200,bbox_inches='tight')


print("Mean error:",np.mean(err))
print("Median error:",np.median(err))


