/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import Bookmark from './Bookmark';
import Tools from 'tinymce/core/api/util/Tools';
import TreeWalker from 'tinymce/core/api/dom/TreeWalker';
import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import { Editor } from 'tinymce/core/api/Editor';
import { HTMLElement, Node } from '@ephox/dom-globals';

/**
 * Unlink implementation that doesn't leave partial links for example it would produce:
 *  a[b<a href="x">c]d</a>e -> a[bc]de
 * instead of:
 *  a[b<a href="x">c]d</a>e -> a[bc]<a href="x">d</a>e
 */

const getSelectedElements = function (rootElm: HTMLElement, startNode: Node, endNode: Node) {
  let walker, node;
  const elms = [];

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

const unwrapElements = function (editor: Editor, elms: HTMLElement) {
  let bookmark, dom, selection;

  dom = editor.dom;
  selection = editor.selection;
  bookmark = Bookmark.create(dom, selection.getRng());

  Tools.each(elms, function (elm) {
    editor.dom.remove(elm, true);
  });

  selection.setRng(Bookmark.resolve(dom, bookmark));
};

const isLink = function (elm: HTMLElement) {
  return elm.nodeName === 'A' && elm.hasAttribute('href');
};

const getParentAnchorOrSelf = function (dom, elm: Node) {
  const anchorElm = dom.getParent(elm, isLink);
  return anchorElm ? anchorElm : elm;
};

const getSelectedAnchors = function (editor: Editor) {
  let startElm, endElm, rootElm, anchorElms, selection, dom, rng;

  selection = editor.selection;
  dom = editor.dom;
  rng = selection.getRng();
  startElm = getParentAnchorOrSelf(dom, RangeUtils.getNode(rng.startContainer, rng.startOffset));
  endElm = RangeUtils.getNode(rng.endContainer, rng.endOffset);
  rootElm = editor.getBody();
  anchorElms = Tools.grep(getSelectedElements(rootElm, startElm, endElm), isLink);

  return anchorElms;
};

const unlinkSelection = function (editor: Editor) {
  unwrapElements(editor, getSelectedAnchors(editor));
};

export default {
  unlinkSelection
};