/**
 * Plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.image.Plugin',
  [
    'tinymce.core.PluginManager',
    'tinymce.plugins.image.api.Commands',
    'tinymce.plugins.image.core.FilterContent',
    'tinymce.plugins.image.ui.Buttons'
  ],
  function (PluginManager, Commands, FilterContent, Buttons) {
    PluginManager.add('image', function (editor) {
      FilterContent.setup(editor);
      Buttons.register(editor);
      Commands.register(editor);

      var imgSize, figureSize;

      editor.on('ObjectResizeStart', function (e) {
        if (editor.dom.is(e.target, 'figure.image')) {
          figureSize = editor.dom.getSize(e.target);
          imgSize = editor.dom.getSize(e.target.firstChild);
        }
      });

      editor.on('ObjectResized', function (e) {
        if (editor.dom.is(e.target, 'figure.image')) {
          var newFigureSize = editor.dom.getSize(e.target);

          if (newFigureSize != figureSize) {
            editor.dom.setStyles(e.target.firstChild, {
              width: imgSize.w + (newFigureSize.w - figureSize.w) + 'px',
              height: imgSize.h + (newFigureSize.h - figureSize.h) + 'px'
            });
          }
        }
      });
    });

    return function () { };
  }
);