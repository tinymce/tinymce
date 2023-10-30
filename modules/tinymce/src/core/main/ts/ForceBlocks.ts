import { Arr, Fun, Obj } from '@ephox/katamari';
import { Insert, SugarElement } from '@ephox/sugar';

import Editor from './api/Editor';
import Schema, { SchemaMap } from './api/html/Schema';
import * as Options from './api/Options';
import * as Bookmarks from './bookmark/Bookmarks';
import * as TransparentElements from './content/TransparentElements';
import * as NodeType from './dom/NodeType';
import * as PaddingBr from './dom/PaddingBr';
import * as Parents from './dom/Parents';
import * as EditorFocus from './focus/EditorFocus';
import * as Namespace from './html/Namespace';

/**
 * Makes sure that everything gets wrapped in paragraphs.
 *
 * @private
 * @class tinymce.ForceBlocks
 */

const isBlockElement = (blockElements: SchemaMap, node: Node) =>
  Obj.has(blockElements, node.nodeName);

const isValidTarget = (schema: Schema, node: Node) => {
  if (NodeType.isText(node)) {
    return true;
  } else if (NodeType.isElement(node)) {
    return !isBlockElement(schema.getBlockElements(), node) && !Bookmarks.isBookmarkNode(node) &&
      !TransparentElements.isTransparentBlock(schema, node) && !Namespace.isNonHtmlElementRoot(node);
  } else {
    return false;
  }
};

const hasBlockParent = (blockElements: SchemaMap, root: Node, node: Node) => {
  return Arr.exists(Parents.parents(SugarElement.fromDom(node), SugarElement.fromDom(root)), (elm) => {
    return isBlockElement(blockElements, elm.dom);
  });
};

const shouldRemoveTextNode = (blockElements: SchemaMap, node: Node) => {
  if (NodeType.isText(node)) {
    if (node.data.length === 0) {
      return true;
    } else if (/^\s+$/.test(node.data)) {
      return !node.nextSibling || isBlockElement(blockElements, node.nextSibling) || Namespace.isNonHtmlElementRoot(node.nextSibling);
    }
  }

  return false;
};

const createRootBlock = (editor: Editor): HTMLElement =>
  editor.dom.create(Options.getForcedRootBlock(editor), Options.getForcedRootBlockAttrs(editor));

const addRootBlocks = (editor: Editor) => {
  const dom = editor.dom, selection = editor.selection;
  const schema = editor.schema;
  const blockElements = schema.getBlockElements();
  const startNode = selection.getStart();
  const rootNode = editor.getBody();
  let rootBlockNode: Node | undefined | null;
  let tempNode: Node;
  let wrapped = false;

  const forcedRootBlock = Options.getForcedRootBlock(editor);
  if (!startNode || !NodeType.isElement(startNode)) {
    return;
  }

  const rootNodeName = rootNode.nodeName.toLowerCase();
  if (!schema.isValidChild(rootNodeName, forcedRootBlock.toLowerCase()) || hasBlockParent(blockElements, rootNode, startNode)) {
    return;
  }

  // Get current selection
  const rng = selection.getRng();
  const { startContainer, startOffset, endContainer, endOffset } = rng;
  const restoreSelection = EditorFocus.hasFocus(editor);

  // Wrap non block elements and text nodes
  let node = rootNode.firstChild;
  while (node) {
    if (NodeType.isElement(node)) {
      TransparentElements.updateElement(schema, node);
    }

    if (isValidTarget(schema, node)) {
      // Remove empty text nodes and nodes containing only whitespace
      if (shouldRemoveTextNode(blockElements, node)) {
        tempNode = node;
        node = node.nextSibling;
        dom.remove(tempNode);
        continue;
      }

      if (!rootBlockNode) {
        rootBlockNode = createRootBlock(editor);
        rootNode.insertBefore(rootBlockNode, node);
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

const insertEmptyLine = (editor: Editor, root: SugarElement<HTMLElement>, insertBlock: (root: SugarElement<HTMLElement>, block: SugarElement<HTMLElement>) => void): Range => {
  const block = SugarElement.fromDom(createRootBlock(editor));
  const br = PaddingBr.createPaddingBr();

  Insert.append(block, br);
  insertBlock(root, block);

  const rng = document.createRange();
  rng.setStartBefore(br.dom);
  rng.setEndBefore(br.dom);
  return rng;
};

const setup = (editor: Editor): void => {
  editor.on('NodeChange', Fun.curry(addRootBlocks, editor));
};

export {
  insertEmptyLine,
  setup
};
