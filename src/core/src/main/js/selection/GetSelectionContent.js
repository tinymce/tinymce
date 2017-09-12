/**
 * GetSelectionContent.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2017 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

define(
  'tinymce.core.selection.GetSelectionContent',
  [
    'ephox.sugar.api.node.Element',
    'tinymce.core.selection.EventProcessRanges',
    'tinymce.core.selection.FragmentReader',
    'tinymce.core.selection.MultiRange',
    'tinymce.core.text.Zwsp'
  ],
  function (Element, EventProcessRanges, FragmentReader, MultiRange, Zwsp) {
    var getContent = function (editor, args) {
      var rng = editor.selection.getRng(), tmpElm = editor.dom.create("body");
      var sel = editor.selection.getSel(), whiteSpaceBefore, whiteSpaceAfter, fragment;
      var ranges = EventProcessRanges.processRanges(editor, MultiRange.getRanges(sel));

      args = args || {};
      whiteSpaceBefore = whiteSpaceAfter = '';
      args.get = true;
      args.format = args.format || 'html';
      args.selection = true;

      args = editor.fire('BeforeGetContent', args);
      if (args.isDefaultPrevented()) {
        editor.fire('GetContent', args);
        return args.content;
      }

      if (args.format === 'text') {
        return editor.selection.isCollapsed() ? '' : Zwsp.trim(rng.text || (sel.toString ? sel.toString() : ''));
      }

      if (rng.cloneContents) {
        fragment = args.contextual ? FragmentReader.read(Element.fromDom(editor.getBody()), ranges).dom() : rng.cloneContents();
        if (fragment) {
          tmpElm.appendChild(fragment);
        }
      } else if (rng.item !== undefined || rng.htmlText !== undefined) {
        // IE will produce invalid markup if elements are present that
        // it doesn't understand like custom elements or HTML5 elements.
        // Adding a BR in front of the contents and then remoiving it seems to fix it though.
        tmpElm.innerHTML = '<br>' + (rng.item ? rng.item(0).outerHTML : rng.htmlText);
        tmpElm.removeChild(tmpElm.firstChild);
      } else {
        tmpElm.innerHTML = rng.toString();
      }

      // Keep whitespace before and after
      if (/^\s/.test(tmpElm.innerHTML)) {
        whiteSpaceBefore = ' ';
      }

      if (/\s+$/.test(tmpElm.innerHTML)) {
        whiteSpaceAfter = ' ';
      }

      args.getInner = true;

      args.content = editor.selection.isCollapsed() ? '' : whiteSpaceBefore + editor.selection.serializer.serialize(tmpElm, args) + whiteSpaceAfter;
      editor.fire('GetContent', args);

      return args.content;
    };

    return {
      getContent: getContent
    };
  }
);
