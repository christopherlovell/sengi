import matplotlib.pyplot as plt

import numpy as np
from sklearn.decomposition import NMF
from grids.h5py_utils import load_h5py

name = 'bpass'

fname = 'grids/%s.h5'%name
spec = load_h5py(fname,'spec')
ages = load_h5py(fname,'ages')
Z = load_h5py(fname,'metallicities')
wl = load_h5py(fname,'wavelength')

wl_mask = (wl > 2e3) & (wl < 1e4)
wl = wl[wl_mask]
resolution = np.sum(wl_mask)
shape = len(Z) * len(ages)

spec_fit = spec[:,:,wl_mask].reshape((shape,resolution))



Ncomps = [4,8,12,16,20,24,28]
colors = plt.cm.viridis(np.linspace(0,0.95,len(Ncomps)))

# frob_norm = np.zeros(len(Ncomps))
# 
# estimated_spectra = {N: None for N in Ncomps}
# 
# 
# 
# for i,(c,comps) in enumerate(zip(colors,Ncomps)):
#     print("Ncomps:",comps)
# 
#     nmf = NMF(n_components=comps, init='nndsvdar', max_iter=int(1e3), 
#               solver='mu', beta_loss='itakura-saito')
# 
#     coeffs = nmf.fit_transform(spec_fit)
#     components = nmf.components_
# 
#     frob_norm[i] = nmf.reconstruction_err_
#     estimated_spectra[comps] = coeffs @ components


import pickle as pcl
#pcl.dump('optim.p',[frob_norm,estimated_spectra])
frob_norm,estimated_spectra = pcl.load(open('optim.p','rb'))


fig, (ax1,ax2) = plt.subplots(2,1,figsize=(5,9))

bins = np.linspace(0,0.08,60)

for i,(c,comps) in enumerate(zip(colors[[0,2,4,6]],np.array(Ncomps)[[0,2,4,6]])):
    
    err = 2 * np.abs(estimated_spectra[comps] - spec_fit) / (spec_fit + estimated_spectra[comps])
    # err[err > 1.] = 1.
    
    ax1.hist(np.median(err,axis=1), bins=bins, density=True,
             histtype='step', label=str(comps), color=c)

    ax2.semilogx(wl, np.median(err,axis=0), label=str(comps), color=c)
    

ax1.set_xlabel('$R_{\mathrm{SMAPE}}$')
ax1.set_ylabel('$N$')

ax2.set_xlabel('$\lambda \,/\, \\AA$')
ax2.set_ylabel('$R_{\mathrm{SMAPE}}$')


ax1.set_xlim(0,)
#ax2.set_ylim(0,0.1)
ax1.legend()
#plt.show()
fig.savefig('plots/optim.png', dpi=200, bbox_inches='tight')



fig, ax = plt.subplots(1,1)

ax.plot(Ncomps, frob_norm)

ax.set_ylabel('$d_{IS}$',size=15)
ax.set_xlabel('$N_{comp}$',size=15)
# ax.set_ylim(0,)

#plt.show()
fig.savefig('plots/div_optim.png', dpi=150, bbox_inches='tight')


