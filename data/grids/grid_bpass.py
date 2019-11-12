from hoki import load
import numpy as np
from glob import glob
from h5py_utils import write_data_h5py

# model_dir = 'BPASSv2.2.1_sin-imf_chab300'
# fname = 'bpass_sin.h5'
model_dir = 'BPASSv2.2.1_bin-imf_chab100'
fname = 'bpass.h5'


models = glob(model_dir+'/*')

output_temp = load.model_output(models[0])

ages = np.array([float(a) for a in output_temp.columns[1:]])
#age_mask = (10**ages / 1e9) < 18 # Gyr
# age_mask = ages < 18 #Gyr
#ages = ages[age_mask]

wl = output_temp['WL'].values
metallicities = np.array([None] * len(models))

spec = np.zeros((len(metallicities),len(ages),len(wl)))

for i,mod in enumerate(models):   
    try:
        metallicities[i] = float('0.'+mod[-7:-4])
    except: # ...catch em# format 
        metallicities[i] = 10**-float(mod[-5])
    

# sort by increasing metallicity
Z_idx = np.argsort(metallicities)
metallicities = metallicities[Z_idx].astype(float)

for i,(Z,mod) in enumerate(zip(metallicities,np.array(models)[Z_idx])):
    print(i,mod,metallicities[i])

    output = load.model_output(mod)

    for j,a in enumerate(ages):
        print(j,str(a))
        spec[i,j] = output[str(a)].values 



# convert units
ages = 10**ages / 1e9 # Gyr
metallicities = np.log10(metallicities / 0.0127)  # log(Z / Zsol)
spec /= 1e6 # Msol


write_data_h5py(fname,'spec',data=spec,overwrite=True)
write_data_h5py(fname,'ages',data=ages,overwrite=True)
write_data_h5py(fname,'metallicities',data=metallicities,overwrite=True)
write_data_h5py(fname,'wavelength',data=wl,overwrite=True)
