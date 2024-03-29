# CrossCompute Extensions for JupyterLab

![Github Actions Status](https://github.com/crosscompute/crosscompute-jupyterlab-extensions/workflows/Build/badge.svg)

This extension is composed of a Python package named `crosscompute_jupyterlab_extensions`
for the server extension and a NPM package named `crosscompute-jupyterlab-extensions`
for the frontend extension.

## Requirements

* JupyterLab >= 2.0

## Install

Note: You will need NodeJS to install the extension.

```bash
pip install crosscompute_jupyterlab_extensions
jupyter serverextension enable --py crosscompute_jupyterlab_extensions --sys-prefix
jupyter labextension install .
jupyter lab build
```

## Troubleshoot

If you are seeing the frontend extension but it is not working, check
that the server extension is enabled:

```bash
jupyter serverextension list
```

If the server extension is installed and enabled but you are not seeing
the frontend, check the frontend is installed:

```bash
jupyter labextension list
```

If it is installed, try:

```bash
jupyter lab clean
jupyter lab build
```

## Contributing

### Install

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Move to crosscompute-jupyterlab-extensions directory

# Install server extension
pip install -e .
# Register server extension
jupyter serverextension enable --py crosscompute_jupyterlab_extensions --sys-prefix

# Install dependencies
jlpm
# Build Typescript source
jlpm build
# Link your development version of the extension with JupyterLab
jupyter labextension install .
# Rebuild Typescript source after making changes
jlpm build
# Rebuild JupyterLab after making any changes
jupyter lab build
```

You can watch the source directory and run JupyterLab in watch mode to watch for changes in the extension's source and automatically rebuild the extension and application.

```bash
# Watch the source directory in another terminal tab
jlpm watch
# Run jupyterlab in watch mode in one terminal tab
jupyter lab --watch --autoreload
```

Now every change will be built locally and bundled into JupyterLab. Be sure to refresh your browser page after saving file changes to reload the extension (note: you'll need to wait for webpack to finish, which can take 10s+ at times).

### Uninstall

```bash
pip uninstall crosscompute_jupyterlab_extensions
jupyter labextension uninstall crosscompute-jupyterlab-extensions
```

## Acknowledgments

Thank you to [Rodrigo Guarachi](https://github.com/rmguarachi) for creating a custom JupyterLab extension and integration with the CrossCompute framework and platform.

Thank you to [Miguel Angel Gordián](https://github.com/zoek1) for testing our JupyterLab extension in different computational environments.
