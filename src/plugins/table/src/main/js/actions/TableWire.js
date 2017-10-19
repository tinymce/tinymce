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
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.table.alien.Util'
  ],

  function (ResizeWire, Body, Element, Util) {
    var get = function (editor) {
      return editor.inline ? ResizeWire.body(Util.getBody(editor), Body.body()) : ResizeWire.only(Element.fromDom(editor.getDoc()));
    };

    return {
      get: get
    };
  }
);
