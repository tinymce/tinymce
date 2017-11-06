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
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.node.Element',
    'tinymce.plugins.table.alien.Util'
  ],

  function (ResizeWire, Insert, Remove, Body, Element, Util) {
    var createContainer = function () {
      var container = Element.fromTag('div');

      Insert.append(Body.body(), container);

      return container;
    };

    var get = function (editor, container) {
      return editor.inline ? ResizeWire.body(Util.getBody(editor), createContainer()) : ResizeWire.only(Element.fromDom(editor.getDoc()));
    };

    var remove = function (editor, wire) {
      if (editor.inline) {
        Remove.remove(wire.parent());
      }
    };

    return {
      get: get,
      remove: remove
    };
  }
);
