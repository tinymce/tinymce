/**
 * VisualBlocks.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Events from '../api/Events';
import Settings from '../api/Settings';
import LoadCss from './LoadCss';

var toggleVisualBlocks = function (editor, pluginUrl, enabledState) {
  var dom = editor.dom;
  var contentCss = Settings.getContentCss(editor);

  LoadCss.load(editor.getDoc(), contentCss ? contentCss : pluginUrl + '/css/visualblocks.css');
  dom.toggleClass(editor.getBody(), 'mce-visualblocks');
  enabledState.set(!enabledState.get());

  Events.fireVisualBlocks(editor, enabledState.get());
};

export default <any> {
  toggleVisualBlocks: toggleVisualBlocks
};