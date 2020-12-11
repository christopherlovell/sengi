import matplotlib.pyplot as plt

import pickle as pcl
import numpy as np
from sklearn.decomposition import NMF
from grids.h5py_utils import load_h5py

name = 'bpass'

fname = 'grids/%s.h5'%name
spec = load_h5py(fname,'spec')
ages = load_h5py(fname,'ages')
Z = load_h5py(fname,'metallicities')
wl = load_h5py(fname,'wavelength')

wl_min = 2e3; wl_max = 1e4
wl_mask = (wl >= wl_min) & (wl <= wl_max)
wl = wl[wl_mask]
resolution = np.sum(wl_mask)
shape = len(Z) * len(ages)

spec_fit = spec[:,:,wl_mask].reshape((shape,resolution))



Ncomps = [4,8,12,16,20,24,28]
colors = plt.cm.viridis(np.linspace(0,0.95,len(Ncomps)))

frob_norm = np.zeros(len(Ncomps))

estimated_spectra = {N: None for N in Ncomps}



for i,(c,comps) in enumerate(zip(colors,Ncomps)):
    print("Ncomps:",comps)

    nmf = NMF(n_components=comps, init='nndsvdar', max_iter=int(1e4), 
              solver='mu', beta_loss='itakura-saito', tol=1e-6)

    coeffs = nmf.fit_transform(spec_fit)
    print('n_iterations:',nmf.n_iter_,'\n')
    components = nmf.components_

    frob_norm[i] = nmf.reconstruction_err_
    estimated_spectra[comps] = coeffs @ components


pcl.dump([frob_norm,estimated_spectra],open('optim_%s.p'%name,'wb'))
# frob_norm,estimated_spectra = pcl.load(open('optim_%s.p'%name,'rb'))


fig, (ax1,ax2) = plt.subplots(2,1,figsize=(5,9))

bins = np.linspace(0,0.08,60)

for i,(c,comps) in enumerate(zip(colors[[0,2,4,6]],np.array(Ncomps)[[0,2,4,6]])):
    
    err = 2 * np.abs(estimated_spectra[comps] - spec_fit) / (spec_fit + estimated_spectra[comps])
    # err[err > 1.] = 1.
    
    ax1.hist(np.median(err,axis=1), bins=bins, density=True,
             histtype='step', label=str(comps), color=c)

    ax2.semilogx(wl, np.median(err,axis=0), label=str(comps), color=c)
    

ax1.set_xlabel('$P_{50} (R_{i,\lambda_{\mathrm{min}}...\lambda_{\mathrm{max}}})$')
ax1.set_ylabel('$N$')
ax2.set_xlabel('$\lambda \,/\, \\AA$')
ax2.set_ylabel('$P_{50} (R_{i...N_{\mathrm{grid}},\lambda})$')

ax1.set_xlim(0,0.06)
ax2.set_xlim(wl_min,wl_max)
ax2.set_ylim(0,)
ax1.legend(title="$N_{\mathrm{comp}} =$")
#plt.show()
fig.savefig('plots/optim.png', dpi=300, bbox_inches='tight')



fig, ax = plt.subplots(1,1)
ax.plot(Ncomps, frob_norm)
ax.set_ylabel('$d_{IS}$',size=15)
ax.set_xlabel('$N_{comp}$',size=15)
# ax.set_ylim(0,)
ax.grid(alpha=0.4)
#plt.show()
fig.savefig('plots/div_optim.png', dpi=300, bbox_inches='tight')

