from hoki import load
import numpy as np
from glob import glob
from h5py_utils import write_data_h5py

model_dir = 'BPASSv2.2.1_bin-imf_chab300'
models = glob(model_dir+'/*')

output_temp = load.model_output(models[0])
ages = np.array([float(a) for a in output_temp.columns[1:]])
wl = output_temp['WL'].values
metallicities = np.array([None] * len(models))

spec = np.zeros((len(metallicities),len(ages),len(wl)))

for i,mod in enumerate(models):    
    try:
        metallicities[i] = float('0.'+mod[-7:-4])
    except: # ...catch em# format 
        metallicities[i] = 10**-float(mod[-5])
    
    output = load.model_output(mod)
    for j,a in enumerate(ages):
        spec[i,j,:] = output[str(a)].values 


# sort by increasing metallicity
Z_idx = np.argsort(metallicities)
metallicities = metallicities[Z_idx].astype(float)
spec = spec[Z_idx,:,:]

# convert units
metallicities = np.log10(metallicities / 0.0127)  # log(Z / Zsol)
ages = 10**ages / 1e9 # Gyr
spec /= 1e6 # Msol

fname = 'bpass.h5'
write_data_h5py(fname,'spec',data=spec,overwrite=True)
write_data_h5py(fname,'ages',data=ages,overwrite=True)
write_data_h5py(fname,'metallicities',data=metallicities,overwrite=True)
write_data_h5py(fname,'wavelength',data=wl,overwrite=True)

