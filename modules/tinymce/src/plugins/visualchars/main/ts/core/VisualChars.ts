import { Arr } from '@ephox/katamari';
import { Class, SugarElement, SugarNode } from '@ephox/sugar';

import Editor from 'tinymce/core/api/Editor';

import * as Data from './Data';
import * as Nodes from './Nodes';

const show = (editor: Editor, rootElm: Element): void => {
  const dom = editor.dom;
  const nodeList = Nodes.filterEditableDescendants(SugarElement.fromDom(rootElm), Nodes.isMatch, editor.dom.isEditable(rootElm));

  Arr.each(nodeList, (n) => {
    const parent = n.dom.parentNode as Node;
    if (Nodes.isWrappedNbsp(parent)) {
      Class.add(SugarElement.fromDom(parent), Data.nbspClass);
    } else {
      const withSpans = Nodes.replaceWithSpans(dom.encode(SugarNode.value(n) ?? ''));

      const div = dom.create('div', {}, withSpans);
      let node: Node | null;
      while ((node = div.lastChild)) {
        dom.insertAfter(node, n.dom);
      }

      editor.dom.remove(n.dom);
    }
  });
};

const hide = (editor: Editor, rootElm: Element): void => {
  const nodeList = editor.dom.select(Data.selector, rootElm);

  Arr.each(nodeList, (node) => {
    if (Nodes.isWrappedNbsp(node)) {
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
