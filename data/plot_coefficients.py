import numpy as np
import matplotlib.pyplot as plt
import matplotlib.gridspec as gridspec

name = 'bpass'

## load text files
wl = np.loadtxt('%s/wavelength.txt'%name)
ages = np.loadtxt('%s/ages.txt'%name)
Z = np.loadtxt('%s/metallicities.txt'%name)
mean = np.loadtxt('%s/mean.txt'%name)
components = np.loadtxt('%s/components.txt'%name)
coeffs = np.loadtxt('%s/coeffs.txt'%name)

shape = len(Z) * len(ages)
resolution = len(wl)
coeffs = coeffs.reshape((len(Z),len(ages),len(components)))


fig = plt.figure(figsize=(18,23))
gs = gridspec.GridSpec(8,5)
gs.update(wspace=0.37)#, hspace=0.)

axes_t = []
axes_b = []
for j in [0,2,4,6]:
    for i in np.arange(5):
        axes_t.append(plt.subplot(gs[j,i]))
        axes_b.append(plt.subplot(gs[j+1,i]))


for i,(axt,axb) in enumerate(zip(axes_t,axes_b)):
    axt.imshow(coeffs[:,:,i]),aspect='auto')#,
               #extent=[Z.min(),Z.max(),ages.min(),ages.max()])
    
    xidxs = [0,13,27,42]
    axt.set_xticks(xidxs)
    print(10**ages[xidxs])
    axt.set_xticklabels(['1 Myr','20 Myr','500 Myr',
                         str(round(10**ages[42],1))+' Gyr'])

    axb.plot(wl/10,components[i])
    
    yidxs = [0,3,6,9,12]
    axt.set_yticks(yidxs)
    axt.set_yticklabels(np.round(Z[yidxs],2))


for idx in [0,5,10,15]:
    axes_t[idx].set_ylabel('$\mathrm{log_{10}(Z \,/\, Z_{\odot})}$')
    axes_b[idx].set_ylabel('$\mathrm{Flux \,/\, (L_{\odot}\,/\,\AA)}$')

for ax in axes_b[15:]:
    ax.set_xlabel('$\mathrm{\lambda \,/\, \mu m}$')

for ax in axes_t[:5]:
    ax.xaxis.tick_top()
    ax.set_xlabel('$\mathrm{Age}$')
    ax.xaxis.set_label_position('top')


# plt.show()
plt.savefig('plots/coeffs_nmf.png',dpi=300,bbox_inches='tight')

