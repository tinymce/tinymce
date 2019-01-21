# TinyMCE 5 Oxide Skin factory

This project contains the tools and files needed to build your own skin for TinyMCE 5.

## Build process

Make sure you have [Node.js](https://nodejs.org) and [Gulp v4+](https://gulpjs.com) installed.

1. Begin by installing all dependencies with `npm install`.
2. Build the skin with `gulp` which also spins up a webserver for previewing the files. (If you just want to build the files, use `gulp build`) .
3. Point your web browser of choice to the address shown in the terminal, usually `localhost:3000`.

## Making a skin
Skin for TinyMCE 5 are written in [LESS](http://lesscss.org), a popular CSS preprocessor. Making a skin primarily involves modifying variables which you can consider as a kind of API. You are not supposed to modify or override CSS rules, instead you override the less variables in your skin files.

Begin by looking in the `src/less/skins/` folder where you find two folders: `ui` which is the skins for the editor and `content` which skins the content within the editor. The skin imports the theme LESS files located in `src/less/theme/`. You are not supposed to edit the CSS in the theme folder, instead we have created variables for relevant css properties such as colors, margins and spacings which you use in your skin file to customize TinyMCE 5. This have multiple benefits. You can do quite advanced changes and still easily update TinyMCE 5 since the only thing you have changed is a variable file, and you benefit from all the browser testing we make.

### Creating a skin

1. Begin by duplicating the `default` folder located in `src/less/slins/ui/` and rename it.
2. Open the file `src/less/theme/globals/global-variables.less` and **copy** the variables you like to change to your `skin.less` file in the folder you duplicated in the previous step. Change the values. The variables you put in `skin.less` will override the default values.
3. For more detailed customizations, review the variables in each component, such as `src/less/theme/components/toolbar-button.less` and copy the ones you want to change to `skin.less`.
4. **CHANGING THE CONTENT UI**
5. Preview your skin by building it. See _Build process_
6. **TRANSFER YOUR SKIN TO TINYMCE**


## Creating a content skin
To update the appearance of the content within the editor, such as headings, quotes, lists etc you create a content skin. These are located in `src/less/skin/content/`
**CONTINUE**

