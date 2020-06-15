/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Node } from '@ephox/dom-globals';
import { Arr, Fun } from '@ephox/katamari';
import { Element } from '@ephox/sugar';
import Editor from './api/Editor';
import * as Settings from './api/Settings';
import * as Bookmarks from './bookmark/Bookmarks';
import * as NodeType from './dom/NodeType';
import * as Parents from './dom/Parents';
import * as EditorFocus from './focus/EditorFocus';

/**
 * Makes sure that everything gets wrapped in paragraphs.
 *
 * @private
 * @class tinymce.ForceBlocks
 */

const isBlockElement = function (blockElements, node) {
  return blockElements.hasOwnProperty(node.nodeName);
};

const isValidTarget = function (blockElements, node) {
  if (NodeType.isText(node)) {
    return true;
  } else if (NodeType.isElement(node)) {
    return !isBlockElement(blockElements, node) && !Bookmarks.isBookmarkNode(node);
  } else {
    return false;
  }
};

const hasBlockParent = function (blockElements, root, node) {
  return Arr.exists(Parents.parents(Element.fromDom(node), Element.fromDom(root)), function (elm) {
    return isBlockElement(blockElements, elm.dom());
  });
};

// const is

const shouldRemoveTextNode = (blockElements, node) => {
  if (NodeType.isText(node)) {
    if (node.nodeValue.length === 0) {
      return true;
    } else if (/^\s+$/.test(node.nodeValue) && (!node.nextSibling || isBlockElement(blockElements, node.nextSibling))) {
      return true;
    }
  }

  return false;
};

const addRootBlocks = function (editor: Editor) {
  const dom = editor.dom, selection = editor.selection;
  const schema = editor.schema, blockElements = schema.getBlockElements();
  let node: Node = selection.getStart();
  const rootNode = editor.getBody();
  let rootBlockNode, tempNode, wrapped;

  const forcedRootBlock = Settings.getForcedRootBlock(editor);
  if (!node || !NodeType.isElement(node) || !forcedRootBlock) {
    return;
  }

  const rootNodeName = rootNode.nodeName.toLowerCase();
  if (!schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase()) || hasBlockParent(blockElements, rootNode, node)) {
    return;
  }

  // Get current selection
  const rng = selection.getRng();
  const startContainer = rng.startContainer;
  const startOffset = rng.startOffset;
  const endContainer = rng.endContainer;
  const endOffset = rng.endOffset;
  const restoreSelection = EditorFocus.hasFocus(editor);

  // Wrap non block elements and text nodes
  node = rootNode.firstChild;
  while (node) {
    if (isValidTarget(blockElements, node)) {
      // Remove empty text nodes and nodes containing only whitespace
      if (shouldRemoveTextNode(blockElements, node)) {
        tempNode = node;
        node = node.nextSibling;
        dom.remove(tempNode);
        continue;
      }

      if (!rootBlockNode) {
        rootBlockNode = dom.create(forcedRootBlock, Settings.getForcedRootBlockAttrs(editor));
        node.parentNode.insertBefore(rootBlockNode, node);
        wrapped = true;
      }

      tempNode = node;
      node = node.nextSibling;
      rootBlockNode.appendChild(tempNode);
    } else {
      rootBlockNode = null;
      node = node.nextSibling;
    }
  }

  if (wrapped && restoreSelection) {
    rng.setStart(startContainer, startOffset);
    rng.setEnd(endContainer, endOffset);
    selection.setRng(rng);
    editor.nodeChanged();
  }
};

const setup = function (editor: Editor) {
  if (Settings.getForcedRootBlock(editor)) {
    editor.on('NodeChange', Fun.curry(addRootBlocks, editor));
  }
};

export {
  setup
};
