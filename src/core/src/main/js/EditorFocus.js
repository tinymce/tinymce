/**
 * EditorFocus.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.EditorFocus',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.node.Element',
    'global!document',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.dom.ElementType',
    'tinymce.core.dom.RangeUtils',
    'tinymce.core.Env'
  ],
  function (Option, Compare, Element, document, CaretFinder, ElementType, RangeUtils, Env) {
    var getContentEditableHost = function (editor, node) {
      return editor.dom.getParent(node, function (node) {
        return editor.dom.getContentEditable(node) === "true";
      });
    };

    var getCollapsedNode = function (rng) {
      return rng.collapsed ? Option.from(RangeUtils.getNode(rng.startContainer, rng.startOffset)).map(Element.fromDom) : Option.none();
    };

    var getFocusInElement = function (root, rng) {
      return getCollapsedNode(rng).bind(function (node) {
        if (ElementType.isTableSection(node)) {
          return Option.some(node);
        } else if (Compare.contains(root, node) === false) {
          return Option.some(root);
        } else {
          return Option.none();
        }
      });
    };

    var normalizeSelection = function (editor, rng) {
      getFocusInElement(Element.fromDom(editor.getBody()), rng).bind(function (elm) {
        return CaretFinder.firstPositionIn(elm.dom());
      }).fold(
        function () {
          editor.selection.normalize();
        },
        function (caretPos) {
          editor.selection.setRng(caretPos.toRange());
        }
      );
    };

    var focusBody = function (body) {
      if (body.setActive) {
        // IE 11 sometimes throws "Invalid function" then fallback to focus
        // setActive is better since it doesn't scroll to the element being focused
        try {
          body.setActive();
        } catch (ex) {
          body.focus();
        }
      } else {
        body.focus();
      }
    };

    var focusEditor = function (editor) {
      var selection = editor.selection, contentEditable = editor.settings.content_editable;
      var body = editor.getBody(), contentEditableHost, rng = selection.getRng();

      editor.quirks.refreshContentEditable();

      // Move focus to contentEditable=true child if needed
      contentEditableHost = getContentEditableHost(editor, selection.getNode());
      if (editor.$.contains(body, contentEditableHost)) {
        focusBody(contentEditableHost);
        normalizeSelection(editor, rng);
        activateEditor(editor);
        return;
      }

      // Focus the window iframe
      if (!contentEditable) {
        // WebKit needs this call to fire focusin event properly see #5948
        // But Opera pre Blink engine will produce an empty selection so skip Opera
        if (!Env.opera) {
          focusBody(body);
        }

        editor.getWin().focus();
      }

      // Focus the body as well since it's contentEditable
      if (Env.gecko || contentEditable) {
        // Restore previous selection before focus to prevent Chrome from
        // jumping to the top of the document in long inline editors
        if (contentEditable && document.activeElement !== body) {
          editor.selection.setRng(editor.lastRng);
        }

        focusBody(body);
        normalizeSelection(editor, rng);
      }

      activateEditor(editor);
    };

    var activateEditor = function (editor) {
      editor.editorManager.setActive(editor);
    };

    var focus = function (editor, skipFocus) {
      if (editor.removed) {
        return;
      }

      skipFocus ? activateEditor(editor) : focusEditor(editor);
    };

    return {
      focus: focus
    };
  }
);
