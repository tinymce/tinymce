/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Element, Node } from '@ephox/dom-globals';
import { Arr } from '@ephox/katamari';
import { Class, Element as SugarElement, Node as SugarNode } from '@ephox/sugar';
import Editor from 'tinymce/core/api/Editor';
import * as Data from './Data';
import * as Nodes from './Nodes';

const isWrappedNbsp = (node) => node.nodeName.toLowerCase() === 'span' && node.classList.contains('mce-nbsp-wrap');

const show = (editor: Editor, rootElm: Node) => {
  const nodeList = Nodes.filterDescendants(SugarElement.fromDom(rootElm), Nodes.isMatch);

  Arr.each(nodeList, (n) => {
    const parent = n.dom().parentNode;
    if (isWrappedNbsp(parent)) {
      Class.add(SugarElement.fromDom(parent), Data.nbspClass);
    } else {
      const withSpans = Nodes.replaceWithSpans(editor.dom.encode(SugarNode.value(n)));

      const div = editor.dom.create('div', null, withSpans);
      let node: any;
      while ((node = div.lastChild)) {
        editor.dom.insertAfter(node, n.dom());
      }

      editor.dom.remove(n.dom());
    }
  });
};

const hide = (editor: Editor, rootElm: Node) => {
  const nodeList = editor.dom.select(Data.selector, rootElm as Element);

  Arr.each(nodeList, (node) => {
    if (isWrappedNbsp(node)) {
      Class.remove(SugarElement.fromDom(node), Data.nbspClass);
    } else {
      editor.dom.remove(node, true);
    }
  });
};

const toggle = (editor: Editor) => {
  const body = editor.getBody();
  const bookmark = editor.selection.getBookmark();
  let parentNode = Nodes.findParentElm(editor.selection.getNode(), body);

  // if user does select all the parentNode will be undefined
  parentNode = parentNode !== undefined ? parentNode : body;

  hide(editor, parentNode);
  show(editor, parentNode);

  editor.selection.moveToBookmark(bookmark);
};

export {
  show,
  hide,
  toggle
};
