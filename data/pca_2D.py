
import numpy as np
from sklearn.decomposition import PCA
from grids.h5py_utils import load_h5py

name = 'fsps'

fname = 'grids/%s.h5'%name
spec = load_h5py(fname,'spec')
ages = load_h5py(fname,'ages')
Z = load_h5py(fname,'metallicities')
wl = load_h5py(fname,'wavelength')

wl_mask = (wl > 2e3) & (wl < 1e4)
wl = wl[wl_mask]
resolution = np.sum(wl_mask)
comps = 15
shape = len(Z) * len(ages)

spec_fit = spec[:,:,wl_mask].reshape((shape,resolution))

spectra_pca = PCA(n_components=comps, svd_solver='randomized')
coeffs = spectra_pca.fit(spec_fit).transform(spec_fit)

## save to text files
np.savetxt('%s/wavelength.txt'%name,wl)
np.savetxt('%s/ages.txt'%name,np.log10(ages))
np.savetxt('%s/metallicities.txt'%name,Z)
np.savetxt('%s/mean.txt'%name,spectra_pca.mean_)
np.savetxt('%s/components.txt'%name,spectra_pca.components_)
np.savetxt('%s/coeffs.txt'%name,coeffs)

