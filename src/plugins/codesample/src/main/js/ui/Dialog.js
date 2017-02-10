/**
 * Dialog.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * Contains all dialog logic.
 *
 * @class tinymce.codesample.Dialog
 * @private
 */
define(
  'tinymce.plugins.codesample.ui.Dialog',
  [
    'tinymce.core.dom.DOMUtils',
    'tinymce.plugins.codesample.core.Prism',
    'tinymce.plugins.codesample.util.Utils'
  ],
  function (DOMUtils, Prism, Utils) {
    var DOM = DOMUtils.DOM;

    function getLanguages(editor) {
      var defaultLanguages = [
        { text: 'HTML/XML', value: 'markup' },
        { text: 'JavaScript', value: 'javascript' },
        { text: 'CSS', value: 'css' },
        { text: 'PHP', value: 'php' },
        { text: 'Ruby', value: 'ruby' },
        { text: 'Python', value: 'python' },
        { text: 'Java', value: 'java' },
        { text: 'C', value: 'c' },
        { text: 'C#', value: 'csharp' },
        { text: 'C++', value: 'cpp' }
      ];

      var customLanguages = editor.settings.codesample_languages;
      return customLanguages ? customLanguages : defaultLanguages;
    }

    function insertCodeSample(editor, language, code) {
      editor.undoManager.transact(function () {
        var node = getSelectedCodeSample(editor);

        code = DOM.encode(code);

        if (node) {
          editor.dom.setAttrib(node, 'class', 'language-' + language);
          node.innerHTML = code;
          Prism.highlightElement(node);
          editor.selection.select(node);
        } else {
          editor.insertContent('<pre id="__new" class="language-' + language + '">' + code + '</pre>');
          editor.selection.select(editor.$('#__new').removeAttr('id')[0]);
        }
      });
    }

    function getSelectedCodeSample(editor) {
      var node = editor.selection.getNode();

      if (Utils.isCodeSample(node)) {
        return node;
      }

      return null;
    }

    function getCurrentCode(editor) {
      var node = getSelectedCodeSample(editor);

      if (node) {
        return node.textContent;
      }

      return '';
    }

    function getCurrentLanguage(editor) {
      var matches, node = getSelectedCodeSample(editor);

      if (node) {
        matches = node.className.match(/language-(\w+)/);
        return matches ? matches[1] : '';
      }

      return '';
    }

    return {
      open: function (editor) {
        editor.windowManager.open({
          title: "Insert/Edit code sample",
          minWidth: Math.min(DOM.getViewPort().w, editor.getParam('codesample_dialog_width', 800)),
          minHeight: Math.min(DOM.getViewPort().h, editor.getParam('codesample_dialog_height', 650)),
          layout: 'flex',
          direction: 'column',
          align: 'stretch',
          body: [
            {
              type: 'listbox',
              name: 'language',
              label: 'Language',
              maxWidth: 200,
              value: getCurrentLanguage(editor),
              values: getLanguages(editor)
            },

            {
              type: 'textbox',
              name: 'code',
              multiline: true,
              spellcheck: false,
              ariaLabel: 'Code view',
              flex: 1,
              style: 'direction: ltr; text-align: left',
              classes: 'monospace',
              value: getCurrentCode(editor),
              autofocus: true
            }
          ],
          onSubmit: function (e) {
            insertCodeSample(editor, e.data.language, e.data.code);
          }
        });
      }
    };
  }
);