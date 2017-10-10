/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * This class contains all core logic for the stripnbsp plugin.
 *
 * @class tinymce.stripnbsp.Plugin
 * @private
 */
define(
  'tinymce.plugins.stripnbsp.Plugin',
  [
    'tinymce.core.PluginManager'
  ],
  function (PluginManager) {
    PluginManager.add('stripnbsp', function (editor) {
      editor.on('PostProcess', function (e) {
        if (!e.content) {
          return;
        }

        if (editor.getParam('stripnbsp_force')) {
          e.content = e.content.replace(/&nbsp;/gi, ' ');
        } else {

          e.content = e.content.replace(
            /<([a-z0-9-]+)[^>]*>&nbsp;<\/\1>|(?:\s*&nbsp;){2,}|(?:[^>]\s)?&nbsp;(?:\s[^<])?/gi,
            function (match, tagName) {
              if (tagName) {
                return match;
              }

              if (match !== '&nbsp;') {
                return match;
              }

              return ' ';
            }
          );

        }
      });
    });

    return function () { };
  }
);
