/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Arr, Fun, Obj, Optional, Optionals } from '@ephox/katamari';
import { Compare, SugarElement, SugarNode, Traverse } from '@ephox/sugar';

import DOMUtils from '../api/dom/DOMUtils';
import EditorSelection from '../api/dom/Selection';
import DomTreeWalker from '../api/dom/TreeWalker';
import Editor from '../api/Editor';
import Tools from '../api/util/Tools';
import { IdBookmark, IndexBookmark } from '../bookmark/BookmarkTypes';
import * as GetBookmark from '../bookmark/GetBookmark';
import * as NodeType from '../dom/NodeType';
import * as TableCellSelection from './TableCellSelection';

const getStartNode = (rng) => {
  const sc = rng.startContainer, so = rng.startOffset;
  if (NodeType.isText(sc)) {
    return so === 0 ? Optional.some(SugarElement.fromDom(sc)) : Optional.none();
  } else {
    return Optional.from(sc.childNodes[so]).map(SugarElement.fromDom);
  }
};

const getEndNode = (rng) => {
  const ec = rng.endContainer, eo = rng.endOffset;
  if (NodeType.isText(ec)) {
    return eo === ec.data.length ? Optional.some(SugarElement.fromDom(ec)) : Optional.none();
  } else {
    return Optional.from(ec.childNodes[eo - 1]).map(SugarElement.fromDom);
  }
};

const getFirstChildren = (node) => {
  return Traverse.firstChild(node).fold(
    Fun.constant([ node ]),
    (child) => {
      return [ node ].concat(getFirstChildren(child));
    }
  );
};

const getLastChildren = (node) => {
  return Traverse.lastChild(node).fold(
    Fun.constant([ node ]),
    (child) => {
      if (SugarNode.name(child) === 'br') {
        return Traverse.prevSibling(child).map((sibling) => {
          return [ node ].concat(getLastChildren(sibling));
        }).getOr([]);
      } else {
        return [ node ].concat(getLastChildren(child));
      }
    }
  );
};

const hasAllContentsSelected = (elm, rng) => {
  return Optionals.lift2(getStartNode(rng), getEndNode(rng), (startNode, endNode) => {
    const start = Arr.find(getFirstChildren(elm), Fun.curry(Compare.eq, startNode));
    const end = Arr.find(getLastChildren(elm), Fun.curry(Compare.eq, endNode));
    return start.isSome() && end.isSome();
  }).getOr(false);
};

const moveEndPoint = (dom: DOMUtils, rng: Range, node: Node, start: boolean): void => {
  const root = node, walker = new DomTreeWalker(node, root);
  const moveCaretBeforeOnEnterElementsMap = Obj.filter(dom.schema.getMoveCaretBeforeOnEnterElements(), (_, name) =>
    !Arr.contains([ 'td', 'th', 'table' ], name.toLowerCase())
  );

  do {
    if (NodeType.isText(node) && Tools.trim(node.nodeValue).length !== 0) {
      if (start) {
        rng.setStart(node, 0);
      } else {
        rng.setEnd(node, node.nodeValue.length);
      }

      return;
    }

    // BR/IMG/INPUT elements but not table cells
    if (moveCaretBeforeOnEnterElementsMap[node.nodeName]) {
      if (start) {
        rng.setStartBefore(node);
      } else {
        if (node.nodeName === 'BR') {
          rng.setEndBefore(node);
        } else {
          rng.setEndAfter(node);
        }
      }

      return;
    }
  } while ((node = (start ? walker.next() : walker.prev())));

  // Failed to find any text node or other suitable location then move to the root of body
  if (root.nodeName === 'BODY') {
    if (start) {
      rng.setStart(root, 0);
    } else {
      rng.setEnd(root, root.childNodes.length);
    }
  }
};

const hasAnyRanges = (editor: Editor) => {
  const sel = editor.selection.getSel();
  return sel && sel.rangeCount > 0;
};

const runOnRanges = (editor: Editor, executor: (rng: Range, fake: boolean) => void) => {
  // Check to see if a fake selection is active. If so then we are simulating a multi range
  // selection so we should return a range for each selected node.
  // Note: Currently tables are the only thing supported for fake selections.
  const fakeSelectionNodes = TableCellSelection.getCellsFromEditor(editor);
  if (fakeSelectionNodes.length > 0) {
    Arr.each(fakeSelectionNodes, (elem) => {
      const node = elem.dom;
      const fakeNodeRng = editor.dom.createRng();
      fakeNodeRng.setStartBefore(node);
      fakeNodeRng.setEndAfter(node);
      executor(fakeNodeRng, true);
    });
  } else {
    executor(editor.selection.getRng(), false);
  }
};

const preserve = (selection: EditorSelection, fillBookmark: boolean, executor: (bookmark: IdBookmark | IndexBookmark) => void) => {
  const bookmark = GetBookmark.getPersistentBookmark(selection, fillBookmark);
  executor(bookmark);
  selection.moveToBookmark(bookmark);
};

export {
  hasAllContentsSelected,
  moveEndPoint,
  hasAnyRanges,
  runOnRanges,
  preserve
};
