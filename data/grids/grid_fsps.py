import numpy as np
import os
#import pickle as pcl

import fsps

Zsol = 0.0127

import h5py

def grid(Nage=80, NZ=20, nebular=True, dust=False):
    """
    Generate grid of spectra with FSPS

    Returns:
        spec (array, float) spectra, dimensions NZ*Nage
        metallicities (array, float) metallicity array, units Z / Zsol
        scale_factors (array, flota) age array in units of the scale factor
        wl (array, float) wavelength array in Angstroms
    """

    if dust:
        sp = fsps.StellarPopulation(zcontinuous=1, sfh=0,
                                    logzsol=0.0, add_neb_emission=nebular,
                                    dust_type=2, dust2=0.2, cloudy_dust=True,
                                    dust1=0.0) # dust_type=1, dust2=0.2, dust1=0.2)
    else:
        sp = fsps.StellarPopulation(zcontinuous=1, sfh=0, cloudy_dust=True,
                                    logzsol=0.0, add_neb_emission=nebular)


    wl = np.array(sp.get_spectrum(tage=13, peraa=True)).T[:,0]

    ages = np.logspace(-3.5,np.log10(15),num=Nage,base=10)
    metallicities = np.linspace(3e-3, 5e-2, num=NZ) / Zsol

    spec = np.zeros((len(metallicities), len(ages), len(wl)))

    for i, Z in enumerate(metallicities):
        for j, a in enumerate(ages):

            sp.params['logzsol'] = np.log10(Z)
            if nebular: sp.params['gas_logz'] = np.log10(Z)

            spec[i,j] = sp.get_spectrum(tage=a, peraa=True)[1]   # Lsol / AA


    return spec, ages, metallicities, wl



if __name__ == "__main__":

    spec, Z, ages, wl = grid(nebular=False, dust=False, Nage=20, NZ=20)
    Z = Z * Zsol  # pickle files in absolute metal fractions

    from h5py_utils import write_data_h5py

    fname = 'fsps.h5'
    write_data_h5py(fname,'spec',data=spec,overwrite=True)
    write_data_h5py(fname,'ages',data=ages,overwrite=True)
    write_data_h5py(fname,'metallicities',data=Z,overwrite=True)
    write_data_h5py(fname,'wavelength',data=wl,overwrite=True)

    spec, Z, ages, wl = grid(nebular=True, dust=False, Nage=20, NZ=20)
    Z = Z * Zsol  # pickle files in absolute metal fractions

    fname = 'fsps_neb.h5'
    write_data_h5py(fname,'spec',data=spec,overwrite=True)
    write_data_h5py(fname,'ages',data=ages,overwrite=True)
    write_data_h5py(fname,'metallicities',data=Z,overwrite=True)
    write_data_h5py(fname,'wavelength',data=wl,overwrite=True)
