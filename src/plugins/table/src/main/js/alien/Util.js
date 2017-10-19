/**
 * Clipboard.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.table.alien.Util',

  [
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element'
  ],

  function (Compare, Element) {
    var getBody = function (editor) {
      return Element.fromDom(editor.getBody());
    };
    var getIsRoot = function (editor) {
      return function (element) {
        return Compare.eq(element, getBody(editor));
      };
    };

    return {
      getBody: getBody,
      getIsRoot: getIsRoot
    };
  }
);
