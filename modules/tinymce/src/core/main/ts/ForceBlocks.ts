import { Arr, Fun, Obj } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Editor from './api/Editor';
import { SchemaMap } from './api/html/Schema';
import * as Options from './api/Options';
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

const isBlockElement = (blockElements: SchemaMap, node: Node) =>
  Obj.has(blockElements, node.nodeName);

const isValidTarget = (blockElements, node) => {
  if (NodeType.isText(node)) {
    return true;
  } else if (NodeType.isElement(node)) {
    return !isBlockElement(blockElements, node) && !Bookmarks.isBookmarkNode(node);
  } else {
    return false;
  }
};

const hasBlockParent = (blockElements, root, node) => {
  return Arr.exists(Parents.parents(SugarElement.fromDom(node), SugarElement.fromDom(root)), (elm) => {
    return isBlockElement(blockElements, elm.dom);
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

const addRootBlocks = (editor: Editor) => {
  const dom = editor.dom, selection = editor.selection;
  const schema = editor.schema, blockElements = schema.getBlockElements();
  let node: Node = selection.getStart();
  const rootNode = editor.getBody();
  let rootBlockNode: Node, tempNode: Node, wrapped: boolean;

  const forcedRootBlock = Options.getForcedRootBlock(editor);
  if (!node || !NodeType.isElement(node)) {
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
        rootBlockNode = dom.create(forcedRootBlock, Options.getForcedRootBlockAttrs(editor));
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

const setup = (editor: Editor) => {
  editor.on('NodeChange', Fun.curry(addRootBlocks, editor));
};

export {
  setup
};
