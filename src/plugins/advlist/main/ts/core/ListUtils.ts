/**
* ListUtils.js
*
* Released under LGPL License.
* Copyright (c) 1999-2017 Ephox Corp. All rights reserved
*
* License: http://www.tinymce.com/license
* Contributing: http://www.tinymce.com/contributing
*/
import { Option } from '@ephox/katamari';

const isChildOfBody = function (editor, elm) {
 return editor.$.contains(editor.getBody(), elm);
};

const isTableCellNode = function (node) {
 return node && /^(TH|TD)$/.test(node.nodeName);
};

const isListNode = function (editor) {
  return function (node) {
    return node && (/^(OL|UL|DL)$/).test(node.nodeName) && isChildOfBody(editor, node);
  };
};

const getSelectedStyleType = function (editor): Option<string> {
 const listElm = editor.dom.getParent(editor.selection.getNode(), 'ol,ul');
 const style = editor.dom.getStyle(listElm, 'listStyleType');
 return Option.from(style);
};

export default {
 isTableCellNode,
 isListNode,
 getSelectedStyleType
};