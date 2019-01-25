# TinyMCE Oxide skin tools
This project contains the default skins as well as tools and files needed to build your own skin for TinyMCE.

Visit the [TinyMCE documentation](https://www.tiny.cloud/docs-beta/advanced/creating-a-skin/) for instruction on how to create and build skins for TinyMCE.

## Building the skins
The build process uses [Node](http://nodejs.org/) and [Gulp](http://gulpjs.com/). Make sure you have both installed before you continue.

1. Install dependencies with `npm install`.
2. Build the skins using the `gulp` command. This command also launches a webserver with file watching for easy development. If you just want to build the files, use the `gulp build` command.
3. Point your web browser to the address shown in the terminal. Usually `localhost:3000`.
