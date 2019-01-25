# TinyMCE Oxide skin tools
This project contains the default skins as well as tools and files needed to build your own skin for TinyMCE.

Visit the [TinyMCE documentation](https://www.tiny.cloud/docs-beta/advanced/creating-a-skin/) for instruction on how to create and build skins for TinyMCE.

## Building the skins
The build process uses [Node](http://nodejs.org/) and [Gulp](http://gulpjs.com/). Make sure you have both installed before you continue.

1. Install dependencies with `npm install`.
2. To build the skins and view them run the `npm run start` command. It includes file watching and automatic browser reloading for easy development. If you just want to build the files without launcong a webserver, use the `npm run build` command.
3. Point your web browser to the address shown in the terminal. Usually `localhost:3000`.
