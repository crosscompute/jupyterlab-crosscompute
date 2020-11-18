from jupyter_packaging import (
    create_cmdclass, install_npm, ensure_targets,
    combine_commands, ensure_python, get_version)
from os.path import abspath, dirname, join
from setuptools import find_packages, setup


HERE = abspath(dirname(__file__))
name = 'crosscompute_jupyterlab_extensions'
ensure_python('>=3.5')
version = get_version(join(name, '_version.py'))
lab_path = join(HERE, name, 'labextension')
jstargets = [join(HERE, 'lib', 'crosscompute-jupyterlab-extensions.js')]
package_data_spec = {name: ['*']}
data_files_spec = [
    ('share/jupyter/lab/extensions',
     lab_path, '*.tgz'),
    ('etc/jupyter/jupyter_notebook_config.d',
     'jupyter-config', 'crosscompute_jupyterlab_extensions.json')]
cmdclass = create_cmdclass(
    'jsdeps',
    package_data_spec=package_data_spec,
    data_files_spec=data_files_spec)
cmdclass['jsdeps'] = combine_commands(
    install_npm(HERE, build_cmd='build:all', npm=['jlpm']),
    ensure_targets(jstargets))
with open('README.md', 'r') as fh:
    long_description = fh.read()
setup_args = dict(
    name=name,
    version=version,
    url='https://github.com/crosscompute/crosscompute-jupyterlab-extensions',
    author='CrossCompute Inc.',
    description='CrossCompute Extensions for JupyterLab',
    long_description=long_description,
    long_description_content_type='text/markdown',
    cmdclass=cmdclass,
    packages=find_packages(),
    install_requires=[
        'jupyterlab ~= 2.0',
        'crosscompute >= 0.8.4.1',
    ],
    zip_safe=False,
    include_package_data=True,
    license='BSD-3-Clause',
    platforms='Linux, Mac OS X, Windows',
    keywords=['Jupyter', 'JupyterLab'],
    classifiers=[
        'License :: OSI Approved :: BSD License',
        'Programming Language :: Python',
        'Programming Language :: Python :: 3',
        'Programming Language :: Python :: 3.5',
        'Programming Language :: Python :: 3.6',
        'Programming Language :: Python :: 3.7',
        'Programming Language :: Python :: 3.8',
        'Framework :: Jupyter',
    ],
)


if __name__ == '__main__':
    setup(**setup_args)
