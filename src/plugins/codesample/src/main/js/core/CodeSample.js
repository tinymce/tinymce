/**
 * CodeSample.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.plugins.codesample.core.CodeSample',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.codesample.core.Prism',
    'tinymce.plugins.codesample.util.Utils'
  ],
  function (DOMUtils, Prism, Utils) {
    var getSelectedCodeSample = function (editor) {
      var node = editor.selection.getNode();

      if (Utils.isCodeSample(node)) {
        return node;
      }

      return null;
    };

    var insertCodeSample = function (editor, datas) {
      editor.undoManager.transact(function () {
        var node = getSelectedCodeSample(editor);
        var className = (datas.dataSrc.trim() != '') ? 'language-text' : 'language-' + datas.language;
        var code;

        if (datas.isLineNumbers) {
          className += ' line-numbers';
        }

        var codeClassName = ' class="language-text"';
        if (datas.dataSrc.trim() != '' != '') {
          code = Utils.pseudoCode({ File: datas.dataSrc.trim() });
          if (datas.isLineNumbers) {
            code += Utils.lineNumbers(code);
          }
        } else if (datas.url.trim() != '') {
          code = Utils.pseudoCode({ Url: datas.url.trim(), Language: datas.language });
          if (datas.isLineNumbers) {
            code += Utils.lineNumbers(code);
          }
        } else {
          codeClassName = '';
          code = DOMUtils.DOM.encode(datas.code.trim());
        }

        if (node) {
          editor.dom.setAttrib(node, 'class', className);
          node.innerHTML = '<code' + codeClassName + '>' + code + '</code>';
          if (datas.highlightedLines.trim() != '') {
            editor.dom.setAttrib(node, 'data-line', datas.highlightedLines.trim());
          }
          if (datas.dataSrc.trim() != '') {
            editor.dom.setAttrib(node, 'data-src', datas.dataSrc.trim());
          } else if (datas.url.trim() != '') {
            editor.dom.setAttrib(node, 'data-jsonp', datas.url.trim());
          } else {
            var codeNode = node.querySelector('code');
            Prism.highlightElement(codeNode);
          }
          editor.selection.select(node);
        } else {
          var highlightedLines = datas.highlightedLines.trim();
          if (highlightedLines != '') {
            highlightedLines = ' data-line="' + highlightedLines + '"';
          }
          var extras = '';
          if (datas.dataSrc.trim() != '') {
            extras = ' data-src="' + datas.dataSrc.trim() + '"';
          } else if (datas.url.trim() != '') {
            extras = ' data-jsonp="' + datas.url.trim() + '"';
          }
          editor.insertContent('<pre id="__new" class="' + className + '"' + extras + highlightedLines + '><code>' + code + '</code></pre>');
          editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
        }
      });
    };

    /*
    var getCurrentCode = function (editor) {
      var node = getSelectedCodeSample(editor);

      if (node) {
        return node.textContent;
      }

      return '';
    };
     * */

    var getDatas = function (editor) {
      var node = getSelectedCodeSample(editor);
      var datas = {
        code: '',
        isLineNumbers: false,
        highlightedLines: '',
        dataSrc: null,
        url: null,
        language: ''
      };

      if (node) {
        datas.isLineNumbers = /\bline-numbers\b/.test(node.className);
        if (node.hasAttribute('data-src')) {
          datas.dataSrc = node.getAttribute('data-src');
        } else if (node.hasAttribute('data-jsonp')) {
          datas.url = node.getAttribute('data-jsonp');
        } else {
          var code = node.querySelector('code');
          if (code != null) {
            datas.code = code.textContent;
          }
        }

        if (datas.dataSrc == null) {
          var matches = node.className.match(/language-(\w+)/);
          if (matches) {
            datas.language = matches[1];
          }
        }
      }

      return datas;
    };

    return {
      getSelectedCodeSample: getSelectedCodeSample,
      insertCodeSample: insertCodeSample,
      // getCurrentCode: getCurrentCode,
      getDatas: getDatas
    };
  }
);