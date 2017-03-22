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
 * This class contains all core logic for the emoticons plugin.
 *
 * @class tinymce.emoticons.Plugin
 * @private
 */
define(
  'tinymce.plugins.emoticons.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.util.Tools'
  ],
  function (PluginManager, Tools) {
    PluginManager.add('emoticons', function (editor, url) {
      var emoticons = [
        ["cool", "cry", "embarassed", "foot-in-mouth"],
        ["frown", "innocent", "kiss", "laughing"],
        ["money-mouth", "sealed", "smile", "surprised"],
        ["tongue-out", "undecided", "wink", "yell"]
      ];

      function getHtml() {
        var emoticonsHtml;

        emoticonsHtml = '<table role="list" class="mce-grid">';

        Tools.each(emoticons, function (row) {
          emoticonsHtml += '<tr>';

          Tools.each(row, function (icon) {
            var emoticonUrl = url + '/img/smiley-' + icon + '.gif';

            emoticonsHtml += '<td><a href="#" data-mce-url="' + emoticonUrl + '" data-mce-alt="' + icon + '" tabindex="-1" ' +
              'role="option" aria-label="' + icon + '"><img src="' +
              emoticonUrl + '" style="width: 18px; height: 18px" role="presentation" /></a></td>';
          });

          emoticonsHtml += '</tr>';
        });

        emoticonsHtml += '</table>';

        return emoticonsHtml;
      }

      editor.addButton('emoticons', {
        type: 'panelbutton',
        panel: {
          role: 'application',
          autohide: true,
          html: getHtml,
          onclick: function (e) {
            var linkElm = editor.dom.getParent(e.target, 'a');

            if (linkElm) {
              editor.insertContent(
                '<img src="' +
                linkElm.getAttribute('data-mce-url') +
                '" alt="' + linkElm.getAttribute('data-mce-alt') +
                '" />'
              );

              this.hide();
            }
          }
        },
        tooltip: 'Emoticons'
      });
    });

    return function () { };
  }
);