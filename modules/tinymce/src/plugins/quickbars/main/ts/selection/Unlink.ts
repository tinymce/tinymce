/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import RangeUtils from 'tinymce/core/api/dom/RangeUtils';
import DomTreeWalker from 'tinymce/core/api/dom/TreeWalker';
import Editor from 'tinymce/core/api/Editor';
import Tools from 'tinymce/core/api/util/Tools';
import * as Bookmark from './Bookmark';

/**
 * Unlink implementation that doesn't leave partial links for example it would produce:
 *  a[b<a href="x">c]d</a>e -> a[bc]de
 * instead of:
 *  a[b<a href="x">c]d</a>e -> a[bc]<a href="x">d</a>e
 */

const getSelectedElements = (rootElm: HTMLElement, startNode: Node, endNode: Node) => {
  let node;
  const elms = [];

  const walker = new DomTreeWalker(startNode, rootElm);
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

const unwrapElements = (editor: Editor, elms: HTMLElement[]) => {
  const dom = editor.dom;
  const selection = editor.selection;
  const bookmark = Bookmark.create(dom, selection.getRng());

  Tools.each(elms, (elm) => {
    editor.dom.remove(elm, true);
  });

  selection.setRng(Bookmark.resolve(dom, bookmark));
};

const isLink = (elm: HTMLElement) => {
  return elm.nodeName === 'A' && elm.hasAttribute('href');
};

const getParentAnchorOrSelf = (dom, elm: Node) => {
  const anchorElm = dom.getParent(elm, isLink);
  return anchorElm ? anchorElm : elm;
};

const getSelectedAnchors = (editor: Editor) => {
  const selection = editor.selection;
  const dom = editor.dom;
  const rng = selection.getRng();
  const startElm = getParentAnchorOrSelf(dom, RangeUtils.getNode(rng.startContainer, rng.startOffset));
  const endElm = RangeUtils.getNode(rng.endContainer, rng.endOffset);
  const rootElm = editor.getBody();

  return Tools.grep(getSelectedElements(rootElm, startElm, endElm), isLink);
};

const unlinkSelection = (editor: Editor) => {
  unwrapElements(editor, getSelectedAnchors(editor));
};

export {
  unlinkSelection
};
