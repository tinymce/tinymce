/**
 * TableWire.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */
define(
  'tinymce.plugins.table.actions.TableWire',

  [
    'ephox.snooker.api.ResizeWire',
    'ephox.sugar.api.node.Element'
  ],

  function (ResizeWire, Element) {
    var get = function (editor) {
      return editor.inline ? ResizeWire.detached(Element.fromDom(editor.getBody()), Element.fromDom(editor.getBody())) : ResizeWire.only(Element.fromDom(editor.getDoc()));
    };

    return {
      get: get
    };
  }
);
