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
  'tinymce.core.focus.EditorFocus',
  [
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Focus',
    'ephox.sugar.api.node.Element',
    'tinymce.core.Env',
    'tinymce.core.caret.CaretFinder',
    'tinymce.core.dom.ElementType',
    'tinymce.core.selection.RangeNodes',
    'tinymce.core.selection.SelectionBookmark'
  ],
  function (Option, Compare, Focus, Element, Env, CaretFinder, ElementType, RangeNodes, SelectionBookmark) {
    var getContentEditableHost = function (editor, node) {
      return editor.dom.getParent(node, function (node) {
        return editor.dom.getContentEditable(node) === "true";
      });
    };

    var getCollapsedNode = function (rng) {
      return rng.collapsed ? Option.from(RangeNodes.getNode(rng.startContainer, rng.startOffset)).map(Element.fromDom) : Option.none();
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

    var hasElementFocus = function (elm) {
      return Focus.hasFocus(elm) || Focus.search(elm).isSome();
    };

    var hasIframeFocus = function (editor) {
      return editor.iframeElement && Focus.hasFocus(Element.fromDom(editor.iframeElement));
    };

    var hasInlineFocus = function (editor) {
      var rawBody = editor.getBody();
      return rawBody && hasElementFocus(Element.fromDom(rawBody));
    };

    var hasFocus = function (editor) {
      return editor.inline ? hasInlineFocus(editor) : hasIframeFocus(editor);
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

      if (editor.bookmark !== undefined && hasFocus(editor) === false) {
        SelectionBookmark.getRng(editor).each(function (bookmarkRng) {
          editor.selection.setRng(bookmarkRng);
          rng = bookmarkRng;
        });
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
      focus: focus,
      hasFocus: hasFocus
    };
  }
);
