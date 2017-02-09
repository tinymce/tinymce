/**
 * CutCopy.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.paste.core.CutCopy',
  [
    'tinymce.plugins.paste.core.InternalHtml'
  ],
  function (InternalHtml) {
    var noop = function () {
    };

    var setHtml5Clipboard = function (clipboardData, html, text) {
      if (clipboardData !== undefined && typeof clipboardData.setData === 'function') {
        try {
          clipboardData.setData('text/html', html);
          clipboardData.setData('text/plain', text);
          clipboardData.setData(InternalHtml.internalHtmlMime(), html);
          return true;
        } catch (e) {
          return false;
        }
      } else {
        return false;
      }
    };

    var setClipboardData = function (evt, data, fallback, done) {
      if (setHtml5Clipboard(evt.clipboardData, data.html, data.text)) {
        evt.preventDefault();
        done();
      } else {
        fallback(data.html, done);
      }
    };

    var fallback = function (editor) {
      return function (html, done) {
        var markedHtml = InternalHtml.mark(html);
        var div = editor.dom.create('div', {}, markedHtml);
        editor.dom.setStyles(div, {
          position: 'fixed',
          left: '-3000px',
          width: '1000px',
          overflow: 'hidden'
        });
        editor.dom.add(editor.getBody(), div);

        var range = editor.selection.getRng();
        var offscreenRange = editor.dom.createRng();
        offscreenRange.selectNodeContents(div);
        editor.selection.setRng(offscreenRange);

        setTimeout(function () {
          div.parentNode.removeChild(div);
          editor.selection.setRng(range);
          done();
        }, 0);
      };
    };

    var getData = function (editor) {
      return {
        html: editor.selection.getContent(),
        text: editor.selection.getContent({ format: 'text' })
      };
    };

    var cut = function (editor) {
      return function (evt) {
        if (editor.selection.isCollapsed() === false) {
          setClipboardData(evt, getData(editor), fallback(editor), function () {
            editor.execCommand('Delete');
          });
        }
      };
    };

    var copy = function (editor) {
      return function (evt) {
        if (editor.selection.isCollapsed() === false) {
          setClipboardData(evt, getData(editor), fallback(editor), noop);
        }
      };
    };

    var register = function (editor) {
      editor.on('cut', cut(editor));
      editor.on('copy', copy(editor));
    };

    return {
      register: register
    };
  }
);