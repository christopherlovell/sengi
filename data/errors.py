import numpy as np
from sklearn.decomposition import PCA, NMF
from grids.h5py_utils import load_h5py

import matplotlib.pyplot as plt
from mpl_toolkits.axes_grid1 import make_axes_locatable
from mpl_toolkits.axes_grid1.inset_locator import (inset_axes, InsetPosition,
                                                  mark_inset)
import matplotlib.gridspec as gridspec


name = 'bc03'
method='nmf'

# original spectra
fname = 'grids/%s.h5'%name
spec = load_h5py(fname,'spec')
wl = load_h5py(fname,'wavelength')

wl_mask = (wl > 2e3) & (wl < 1e4)
wl = wl[wl_mask]
spec = spec[:,:,wl_mask]

## load text files
wl = np.loadtxt('%s/wavelength.txt'%name)
ages = np.loadtxt('%s/ages.txt'%name)
Z = np.loadtxt('%s/metallicities.txt'%name)
mean = np.loadtxt('%s/mean.txt'%name)
components = np.loadtxt('%s/components.txt'%name)
coeffs = np.loadtxt('%s/coeffs.txt'%name)

print(ages)
print(np.log10(ages))

shape = len(Z) * len(ages)
resolution = len(wl)

estimated_spectra = np.array([mean + np.dot(coeffs[i],
                              components) \
                              for i in np.arange(shape)])

estimated_spectra = estimated_spectra.reshape(len(Z),
                                              len(ages),
                                              resolution)

err = 2 * np.abs(estimated_spectra - spec) / (spec + estimated_spectra)

# print(Z.shape, ages.shape)
# i,j = np.unravel_index(np.argmax(np.mean(err, axis=2)), (len(Z), len(ages)))
# print("Maximum Error\n-------------\nerror: %.2f\nmetallicity: [%i] %.2f\nage: [%i] %.2f\n"%(np.mean(err,axis=2).max(),i, Z[i], j, ages[j]))
 
# i = 2
# j = 40
# 
# 
# fig = plt.figure(figsize=(5,8))
# 
# gs = gridspec.GridSpec(2,1)
# gs.update(wspace=0., hspace=0.)
# ax1 = plt.subplot(gs[0])
# ax2 = plt.subplot(gs[1])
# 
# ax1.semilogx(wl, spec[i,j], label='True', alpha=0.6)
# ax1.semilogx(wl, estimated_spectra[i,j], label='Predicted', alpha=0.6)
# ax1.legend()
# ax1.set_ylabel('$L_{\odot} \,/\, \mathrm{\AA}$', size=15)
# ax1.set_xticks([])
# 
# ax1.text(0.05,0.9,'Metallicity ($\mathrm{log_{10}}(Z/Z_{\odot})$: %.2f'%Z[i],transform=ax1.transAxes)
# ax1.text(0.05,0.82,'Age (Gyr): %.2f'%10**ages[j],transform=ax1.transAxes)
# ax1.text(0.05,0.74,r'$\left| R_{\mathrm{SMAPE}} \right| = %.3f$'%np.mean(err[i,j]),transform=ax1.transAxes)
# 
# 
# ax2.semilogx(wl, err[i,j,:], color='red', linewidth=0.1)
# ax2.hlines([0.05,0.1,0.2],wl.min(),wl.max(),linestyle='dashed',alpha=0.5)
# ax2.set_xlabel('$\lambda \,/\, \AA$', size=15)
# ax2.set_ylabel('$R_\mathrm{SMAPE}}$', size=15)
# ax2.set_ylim(0,1)
# 
# ax3 = plt.axes([0,0,1,1])
# ip = InsetPosition(ax1, [0.45,-0.45,0.5,0.5])
# ax3.set_axes_locator(ip)
# mark_inset(ax1, ax3, loc1=3, loc2=1, fc="none", ec='0.5')
# 
# k,l = 800,900
# ax3.semilogx(wl[k:l], spec[i,j,k:l], label='true', alpha=0.6)
# ax3.semilogx(wl[k:l], estimated_spectra[i,j,k:l], label='recon', alpha=0.6)
# ax3.set_ylabel('$L_{\odot} \,/\, \mathrm{\AA}$', size=15)
# 
# ax1.ticklabel_format(style='sci', axis='y', scilimits=(0,0)) 
# ax3.ticklabel_format(style='sci', axis='y', scilimits=(0,0)) 
# 
# for ax in [ax1,ax2]:
#     ax.set_xlim(wl.min(),wl.max())
# 
# for ax in [ax1,ax3]: ax.set_ylim(0,)
# 
# plt.show()
# #fig.savefig('plots/errs_example_%s.png'%method,dpi=200,bbox_inches='tight')



## ---- Error Matrix --- ##

fig, (ax1) = plt.subplots(1,1, figsize=(5,5))

im = ax1.imshow(np.mean(err,axis=2).T, aspect='auto',interpolation='none',
                extent=(0,len(Z),0,len(ages)))

mult=6
amin=int((len(ages)-1) % mult / 2) + 0.5
amax=amin+ mult*int((len(ages)-1) / mult)
ticks = np.linspace(amin,amax,mult)
ax1.set_yticks(ticks)
ax1.set_yticklabels(["%.3f"%(10**a) for a in ages[ticks.astype(int)]],rotation='vertical')

mult=6
amin=int((len(Z)-1) % mult / 2) + 0.5
amax=amin+ mult*int((len(Z)-1) / mult)
ticks = np.linspace(amin,amax,mult)
ax1.set_xticks(ticks)
ax1.set_xticklabels(["%.2f"%z for z in Z[ticks.astype(int)]],rotation='horizontal')

divider = make_axes_locatable(ax1)
cax = divider.append_axes('right', size='5%', pad=0.05)
cbar = fig.colorbar(im, cax=cax)#, orientation='horizontal')
cbar.ax.set_ylabel('$R_{\mathrm{SMAPE}}$', rotation=270, labelpad=18, size=15)

ax1.set_ylabel('Age (Gyr)', size=15,labelpad=15)
ax1.set_xlabel('Metallicity [$\mathrm{log_{10}(Z \,/\, Z_{\odot})}$]', size=15, labelpad=15)

#plt.show()
fig.savefig('plots/errmat_%s.png'%method,dpi=200,bbox_inches='tight')



# ### Plot coefficients ###
# coeffs_plot = coeffs.reshape(len(Z), len(ages), -1)
# vmin = coeffs_plot[:,:,:].min()
# vmax = coeffs_plot[:,:,:].max()# / 2
# 
# fig = plt.figure(figsize=(16,20))
# 
# nx,ny=4,5
# gs = gridspec.GridSpec(2*nx,ny)
# gs.update(wspace=0.4,hspace=0.4)
# 
# axes = np.array([[None] * ny] * nx)
# spec_axes = np.array([[None] * ny] * nx)
# for i in np.arange(nx):
#     for j in np.arange(ny):
#         axes[i,j] = plt.subplot(gs[i*2,j])
#         spec_axes[i,j] = plt.subplot(gs[(i*2)+1,j])
# 
# for i,ax in enumerate(spec_axes.flatten()):
#     ax.semilogx(wl, components[i,:], label='%s'%(i+1), linewidth=0.5)
#     
# for i, ax in enumerate(axes.flatten()):
#     im = ax.imshow(coeffs_plot[:,:,i], aspect='auto',
#                    extent=(0,len(Z),0,len(ages)))    
#     ax.text(.85, .85, '{:2d}'.format(i+1),
#             color='white',size=15,transform=ax.transAxes)
#     divider = make_axes_locatable(ax)
#     cax = divider.append_axes('right', size='5%', pad=0.05)
#     fig.colorbar(im, cax=cax)#, orientation='horizontal')
# 
# mult,amin=6,0.5
# amax=len(ages) - 0.5 #- mult*(len(ages)%mult)
# alen=int(len(ages)/mult) + 1
# for ax in axes[:,0]: 
#     ax.set_yticks(np.linspace(amin,amax,alen))
#     ax.set_yticklabels(["%.3f"%(10**a) for a in ages[::mult]],rotation='horizontal')
# 
# mult=4
# amax=len(Z) - 0.5 #- mult*(len(ages)%mult)
# alen=int(len(Z)/mult) + 1
# for ax in axes[0,:]:
#     ax.xaxis.tick_top()
#     ax.set_xticks(np.linspace(amin,amax,alen))
#     ax.set_xticklabels(["%.2f"%z for z in Z[::mult]],rotation='vertical')
# 
# for ax in axes[:,0]: ax.set_ylabel('$\mathrm{Age \,/\, Gyr}$', size=15)
# 
# for ax in axes[0,:]:
#     ax.set_xlabel('$\mathrm{log_{10}}(Z \,/\, Z_{\odot})$', size=15)
#     ax.xaxis.set_label_position('top')
# 
# for ax in spec_axes[:,0]: ax.set_ylabel('Flux $\,/\, (L_{\odot} \,/\, \AA)$',size=15)
# for ax in spec_axes[-1,:]: ax.set_xlabel('$\lambda \,/\, \AA$',size=15)
# 
# for ax in axes[1:,:].flatten(): ax.set_xticks([])
# for ax in axes[:,1:].flatten(): ax.set_yticks([])
# 
# plt.show()
# #fig.savefig('plots/coeffs_%s.png'%method,dpi=200,bbox_inches='tight')


