import { Arr } from '@ephox/katamari';
import { Class, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Data from './Data';
import * as Nodes from './Nodes';

const isWrappedNbsp = (node: Node): node is HTMLSpanElement =>
  node.nodeName.toLowerCase() === 'span' && (node as HTMLSpanElement).classList.contains('mce-nbsp-wrap');

const show = (editor: Editor, rootElm: Node): void => {
  const nodeList = Nodes.filterDescendants(SugarElement.fromDom(rootElm), Nodes.isMatch);

  Arr.each(nodeList, (n) => {
    const parent = n.dom.parentNode;
    if (isWrappedNbsp(parent)) {
      Class.add(SugarElement.fromDom(parent), Data.nbspClass);
    } else {
      const withSpans = Nodes.replaceWithSpans(editor.dom.encode(SugarNode.value(n)));

      const div = editor.dom.create('div', null, withSpans);
      let node: any;
      while ((node = div.lastChild)) {
        editor.dom.insertAfter(node, n.dom);
      }

      editor.dom.remove(n.dom);
    }
  });
};

const hide = (editor: Editor, rootElm: Node): void => {
  const nodeList = editor.dom.select(Data.selector, rootElm);

  Arr.each(nodeList, (node) => {
    if (isWrappedNbsp(node)) {
      Class.remove(SugarElement.fromDom(node), Data.nbspClass);
    } else {
      editor.dom.remove(node, true);
    }
  });
};

const toggle = (editor: Editor): void => {
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
