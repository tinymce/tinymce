/**
 * VisualBlocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.visualblocks.core.VisualBlocks',
  [
    'tinymce.plugins.visualblocks.api.Events',
    'tinymce.plugins.visualblocks.api.Settings',
    'tinymce.plugins.visualblocks.core.LoadCss'
  ],
  function (Events, Settings, LoadCss) {
    var toggleVisualBlocks = function (editor, pluginUrl, enabledState) {
      var dom = editor.dom;
      var contentCss = Settings.getContentCss(editor);

      LoadCss.load(editor.getDoc(), contentCss ? contentCss : pluginUrl + '/css/visualblocks.css');
      dom.toggleClass(editor.getBody(), 'mce-visualblocks');
      enabledState.set(!enabledState.get());

      Events.fireVisualBlocks(editor, enabledState.get());
    };

    return {
      toggleVisualBlocks: toggleVisualBlocks
    };
  }
);