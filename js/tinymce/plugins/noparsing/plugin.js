/**
 * plugin.js
 *
 * Copyright, Shopify Inc.
 * Released under LGPL License.
 *
 * License: http://www.tinymce.com/license
 */

/*global tinymce:true */

/**
 * No Parsing
 *
 * This plugin prevents HTML content from being parsed and reformatted by TinyMCE.
 */
tinymce.PluginManager.add('noparsing', function(editor) {

  editor.on("BeforeSetContent", function(args) {
    args.format = "unvalidated_html";
  });

  editor.on("BeforeGetContent", function(args) {
    args.format = "unvalidated_html";
  });

});
