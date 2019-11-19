import numpy as np
from sklearn.decomposition import NMF
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
comps = 20
shape = len(Z) * len(ages)

spec_fit = spec[:,:,wl_mask].reshape((shape,resolution))

nmf = NMF(n_components=comps, init='nndsvdar', max_iter=int(5e3), 
          solver='mu', beta_loss='itakura-saito', verbose=True, tol=1e-5)

coeffs = nmf.fit_transform(spec_fit)

## save to text files
np.savetxt('%s/wavelength.txt'%name,wl)
np.savetxt('%s/ages.txt'%name,np.log10(ages))
np.savetxt('%s/metallicities.txt'%name,Z)
np.savetxt('%s/mean.txt'%name,np.zeros(resolution))
np.savetxt('%s/components.txt'%name,nmf.components_)
np.savetxt('%s/coeffs.txt'%name,coeffs)

