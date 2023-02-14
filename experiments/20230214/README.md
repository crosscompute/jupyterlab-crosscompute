# jupyterlab_crosscompute

[![Github Actions Status](https://github.com/crosscompute/jupyterlab-crosscompute/workflows/Build/badge.svg)](https://github.com/crosscompute/jupyterlab-crosscompute/actions/workflows/build.yml)

CrossCompute Extensions for JupyterLab


This extension is composed of a Python package named `jupyterlab_crosscompute`
for the server extension and a NPM package named `jupyterlab-crosscompute`
for the frontend extension.


## Requirements

* JupyterLab >= 3.0

## Install

To install the extension, execute:

```bash
pip install jupyterlab_crosscompute
```

## Uninstall

To remove the extension, execute:

```bash
pip uninstall jupyterlab_crosscompute
```


## Troubleshoot

If you are seeing the frontend extension, but it is not working, check
that the server extension is enabled:

```bash
jupyter server extension list
```

If the server extension is installed and enabled, but you are not seeing
the frontend extension, check the frontend extension is installed:

```bash
jupyter labextension list
```


## Contributing

### Development install

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the jupyterlab_crosscompute directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
# Server extension must be manually installed in develop mode
jupyter server extension enable jupyterlab_crosscompute
# Rebuild extension Typescript source after making changes
jlpm run build
```

You can watch the source directory and run JupyterLab at the same time in different terminals to watch for changes in the extension's source and automatically rebuild the extension.

```bash
# Watch the source directory in one terminal, automatically rebuilding when needed
jlpm run watch
# Run JupyterLab in another terminal
jupyter lab
```

With the watch command running, every saved change will immediately be built locally and available in your running JupyterLab. Refresh JupyterLab to load the change in your browser (you may need to wait several seconds for the extension to be rebuilt).

By default, the `jlpm run build` command generates the source maps for this extension to make it easier to debug using the browser dev tools. To also generate source maps for the JupyterLab core extensions, you can run the following command:

```bash
jupyter lab build --minimize=False
```

### Development uninstall

```bash
# Server extension must be manually disabled in develop mode
jupyter server extension disable jupyterlab_crosscompute
pip uninstall jupyterlab_crosscompute
```

In development mode, you will also need to remove the symlink created by `jupyter labextension develop`
command. To find its location, you can run `jupyter labextension list` to figure out where the `labextensions`
folder is located. Then you can remove the symlink named `jupyterlab-crosscompute` within that folder.

### Packaging the extension

See [RELEASE](RELEASE.md)

## Acknowledgments

Thank you to [Salah Ahmed](https://github.com/salah93) for working on our first Jupyter Notebook extension and integration with the CrossCompute framework and platform.

Thank you to [Rodrigo Guarachi](https://github.com/rmguarachi) for working on our first JupyterLab extension and integration with the CrossCompute framework and platform.

Thank you to [Kashfi Fahim](https://github.com/kashfifahim), [Noé Domínguez Porras](https://github.com/poguez), [Miguel Angel Gordián](https://github.com/zoek1), [Olga Ryabtseva](https://www.linkedin.com/in/olga-creutzburg) for testing our JupyterLab extension in different environments.

Thank you to Mary Rodriguez Gort of the Tampa Bay Innovation Center; Ji Yoon Lee, Tyler Doyle, Alex Hofmann of the American Public Power Association; Shaky Sherpa, Rhonda Jordan-Antoine of the World Bank; Ying Zhou of the Tech Incubator at Queens College for making this work possible.
