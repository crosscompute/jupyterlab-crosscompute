# CrossCompute Extensions for JupyterLab

![Github Actions Status](https://github.com/crosscompute/crosscompute-jupyterlab-extensions/workflows/Build/badge.svg)


This extension is composed of a Python package named `crosscompute_jupyterlab_extensions`
for the server extension and a NPM package named `crosscompute-jupyterlab-extensions`
for the frontend extension.


## Requirements

* JupyterLab >= 3.0
* crosscompute >= 0.8.4.6


## Installation

```bash
pip install crosscompute-jupyterlab-extensions
```

## Usage

You will need to configure CROSSCOMPUTE_TOKEN in your environment to use the printer service. You can find your token on https://crosscompute.com.

```bash
export CROSSCOMPUTE_TOKEN
jupyter lab
```


## Troubleshooting

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


## Development

Note: You will need NodeJS to build the extension package.

The `jlpm` command is JupyterLab's pinned version of
[yarn](https://yarnpkg.com/) that is installed with JupyterLab. You may use
`yarn` or `npm` in lieu of `jlpm` below.

```bash
# Clone the repo to your local environment
# Change directory to the crosscompute_jupyterlab_extensions directory
# Install package in development mode
pip install -e .
# Link your development version of the extension with JupyterLab
jupyter labextension develop . --overwrite
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

## Uninstallation

```bash
pip uninstall crosscompute_jupyterlab_extensions
```


## Acknowledgments

Thank you to [Rodrigo Guarachi](https://github.com/rmguarachi) for creating a custom JupyterLab extension and integration with the CrossCompute framework and platform.

Thank you to [Miguel Angel Gordián](https://github.com/zoek1) for testing our JupyterLab extension in different computational environments.

Thank you to Ji Yoon Lee and Tyler Doyle for user experience feedback.
