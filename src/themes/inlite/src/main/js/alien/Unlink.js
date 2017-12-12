/**
 * Unlink.js
 *
 * Released under LGPL License.
 * Copyright (c) 1999-2016 Ephox Corp. All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

import Bookmark from './Bookmark';
import Tools from 'tinymce/core/util/Tools';
import TreeWalker from 'tinymce/core/dom/TreeWalker';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';

/**
 * Unlink implementation that doesn't leave partial links for example it would produce:
 *  a[b<a href="x">c]d</a>e -> a[bc]de
 * instead of:
 *  a[b<a href="x">c]d</a>e -> a[bc]<a href="x">d</a>e
 */

var getSelectedElements = function (rootElm, startNode, endNode) {
  var walker, node, elms = [];

  walker = new TreeWalker(startNode, rootElm);
  for (node = startNode; node; node = walker.next()) {
    if (node.nodeType === 1) {
      elms.push(node);
    }

    if (node === endNode) {
      break;
    }
  }

  return elms;
};

var unwrapElements = function (editor, elms) {
  var bookmark, dom, selection;

  dom = editor.dom;
  selection = editor.selection;
  bookmark = Bookmark.create(dom, selection.getRng());

  Tools.each(elms, function (elm) {
    editor.dom.remove(elm, true);
  });

  selection.setRng(Bookmark.resolve(dom, bookmark));
};

var isLink = function (elm) {
  return elm.nodeName === 'A' && elm.hasAttribute('href');
};

var getParentAnchorOrSelf = function (dom, elm) {
  var anchorElm = dom.getParent(elm, isLink);
  return anchorElm ? anchorElm : elm;
};

var getSelectedAnchors = function (editor) {
  var startElm, endElm, rootElm, anchorElms, selection, dom, rng;

  selection = editor.selection;
  dom = editor.dom;
  rng = selection.getRng();
  startElm = getParentAnchorOrSelf(dom, RangeUtils.getNode(rng.startContainer, rng.startOffset));
  endElm = RangeUtils.getNode(rng.endContainer, rng.endOffset);
  rootElm = editor.getBody();
  anchorElms = Tools.grep(getSelectedElements(rootElm, startElm, endElm), isLink);

  return anchorElms;
};

var unlinkSelection = function (editor) {
  unwrapElements(editor, getSelectedAnchors(editor));
};

export default <any> {
  unlinkSelection: unlinkSelection
};