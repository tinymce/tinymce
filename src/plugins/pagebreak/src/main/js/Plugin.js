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
 * This class contains all core logic for the pagebreak plugin.
 *
 * @class tinymce.pagebreak.Plugin
 * @private
 */
define(
  'tinymce.plugins.pagebreak.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.core.Env'
  ],
  function (PluginManager, Env) {
    PluginManager.add('pagebreak', function (editor) {
      var pageBreakClass = 'mce-pagebreak', separatorHtml = editor.getParam('pagebreak_separator', '<!-- pagebreak -->');

      var pageBreakSeparatorRegExp = new RegExp(separatorHtml.replace(/[\?\.\*\[\]\(\)\{\}\+\^\$\:]/g, function (a) {
        return '\\' + a;
      }), 'gi');

      var pageBreakPlaceHolderHtml = '<img src="' + Env.transparentSrc + '" class="' +
        pageBreakClass + '" data-mce-resize="false" data-mce-placeholder />';

      // Register commands
      editor.addCommand('mcePageBreak', function () {
        if (editor.settings.pagebreak_split_block) {
          editor.insertContent('<p>' + pageBreakPlaceHolderHtml + '</p>');
        } else {
          editor.insertContent(pageBreakPlaceHolderHtml);
        }
      });

      // Register buttons
      editor.addButton('pagebreak', {
        title: 'Page break',
        cmd: 'mcePageBreak'
      });

      editor.addMenuItem('pagebreak', {
        text: 'Page break',
        icon: 'pagebreak',
        cmd: 'mcePageBreak',
        context: 'insert'
      });

      editor.on('ResolveName', function (e) {
        if (e.target.nodeName == 'IMG' && editor.dom.hasClass(e.target, pageBreakClass)) {
          e.name = 'pagebreak';
        }
      });

      editor.on('click', function (e) {
        e = e.target;

        if (e.nodeName === 'IMG' && editor.dom.hasClass(e, pageBreakClass)) {
          editor.selection.select(e);
        }
      });

      editor.on('BeforeSetContent', function (e) {
        e.content = e.content.replace(pageBreakSeparatorRegExp, pageBreakPlaceHolderHtml);
      });

      editor.on('PreInit', function () {
        editor.serializer.addNodeFilter('img', function (nodes) {
          var i = nodes.length, node, className;

          while (i--) {
            node = nodes[i];
            className = node.attr('class');
            if (className && className.indexOf('mce-pagebreak') !== -1) {
              // Replace parent block node if pagebreak_split_block is enabled
              var parentNode = node.parent;
              if (editor.schema.getBlockElements()[parentNode.name] && editor.settings.pagebreak_split_block) {
                parentNode.type = 3;
                parentNode.value = separatorHtml;
                parentNode.raw = true;
                node.remove();
                continue;
              }

              node.type = 3;
              node.value = separatorHtml;
              node.raw = true;
            }
          }
        });
      });
    });

    return function () { };
  }
);