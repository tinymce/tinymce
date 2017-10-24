/**
 * SelectionRestore.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.SelectionRestore',
  [
    'ephox.katamari.api.Throttler',
    'ephox.sand.api.PlatformDetection',
    'global!document',
    'tinymce.core.dom.DOMUtils',
    'tinymce.core.selection.SelectionBookmark'
  ],
  function (Throttler, PlatformDetection, document, DOMUtils, SelectionBookmark) {
    var isManualNodeChange = function (e) {
      return e.type === 'nodechange' && e.selectionChange;
    };

    var registerPageMouseUp = function (editor, throttledStore) {
      var mouseUpPage = function () {
        throttledStore.throttle();
      };

      DOMUtils.DOM.bind(document, 'mouseup', mouseUpPage);

      editor.on('remove', function () {
        DOMUtils.DOM.unbind(document, 'mouseup', mouseUpPage);
      });
    };

    var registerFocusOut = function (editor) {
      editor.on('focusout', function () {
        SelectionBookmark.store(editor);
      });
    };

    var registerMouseUp = function (editor, throttledStore) {
      editor.on('mouseup touchend', function (e) {
        throttledStore.throttle();
      });
    };

    var registerEditorEvents = function (editor, throttledStore) {
      var browser = PlatformDetection.detect().browser;

      if (browser.isIE() || browser.isEdge()) {
        registerFocusOut(editor);
      } else {
        registerMouseUp(editor, throttledStore);
      }

      editor.on('keyup nodechange', function (e) {
        if (!isManualNodeChange(e)) {
          SelectionBookmark.store(editor);
        }
      });
    };

    var register = function (editor) {
      var throttledStore = Throttler.first(function () {
        SelectionBookmark.store(editor);
      }, 0);

      if (editor.inline) {
        registerPageMouseUp(editor, throttledStore);
      }

      editor.on('init', function () {
        registerEditorEvents(editor, throttledStore);
      });

      editor.on('remove', function () {
        throttledStore.cancel();
      });
    };

    return {
      register: register
    };
  }
);
