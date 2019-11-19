import numpy as np
import os
import fsps

from h5py_utils import write_data_h5py

def grid(Nage=80, NZ=20, nebular=True, dust=False):
    """
    Generate grid of spectra with FSPS

    Returns:
        spec (array, float) spectra, dimensions NZ*Nage
        age (array, float) age array, Gyr
        metallicities (array, float) metallicity array, Z/Zsol
        wl (array, float) wavelength array in Angstroms
    """

    if dust:
        sp = fsps.StellarPopulation(zcontinuous=1, sfh=0,
                                    logzsol=0.0, add_neb_emission=nebular,
                                    dust_type=2, dust2=0.2, cloudy_dust=True,
                                    dust1=0.0) # dust_type=1, dust2=0.2, dust1=0.2)
    else:
        sp = fsps.StellarPopulation(zcontinuous=1, sfh=0, cloudy_dust=True,
                                    add_neb_emission=nebular)


    wl = np.array(sp.get_spectrum(tage=13, peraa=True)).T[:,0]

    ages = np.logspace(-2,np.log10(15),num=Nage,base=10)
    metallicities = np.linspace(-2, 1, num=NZ) # log(Z / Zsol)

    spec = np.zeros((len(metallicities), len(ages), len(wl)))

    for i, Z in enumerate(metallicities):
        for j, a in enumerate(ages):

            sp.params['logzsol'] = Z
            if nebular: sp.params['gas_logz'] = Z

            spec[i,j] = sp.get_spectrum(tage=a, peraa=True)[1]   # Lsol / AA


    return spec, ages, metallicities, wl



if __name__ == "__main__":

    Nage = 81
    NZ = 41

    spec, ages, Z, wl = grid(nebular=False, dust=False, Nage=Nage, NZ=NZ)

    fname = 'fsps.h5'
    write_data_h5py(fname,'spec',data=spec,overwrite=True)
    write_data_h5py(fname,'ages',data=ages,overwrite=True)
    write_data_h5py(fname,'metallicities',data=Z,overwrite=True)
    write_data_h5py(fname,'wavelength',data=wl,overwrite=True)

    spec, ages, Z, wl = grid(nebular=True, dust=False, Nage=Nage, NZ=NZ)

    fname = 'fsps_neb.h5'
    write_data_h5py(fname,'spec',data=spec,overwrite=True)
    write_data_h5py(fname,'ages',data=ages,overwrite=True)
    write_data_h5py(fname,'metallicities',data=Z,overwrite=True)
    write_data_h5py(fname,'wavelength',data=wl,overwrite=True)
