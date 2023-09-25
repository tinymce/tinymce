import { Adt, Fun, Optional, Type } from '@ephox/katamari';
import { SugarElement } from '@ephox/sugar';

import Schema from '../api/html/Schema';
import { findNextBr, findPreviousBr, isAfterBr, isBeforeBr } from '../caret/CaretBr';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import { isAfterContentEditableFalse, isBeforeContentEditableFalse } from '../caret/CaretPositionPredicates';
import * as CaretUtils from '../caret/CaretUtils';
import * as ElementType from '../dom/ElementType';
import * as Empty from '../dom/Empty';
import * as NodeType from '../dom/NodeType';
import * as DeleteUtils from './DeleteUtils';

export interface DeleteActionAdt {
  fold: <T> (
    remove: (element: Node) => T,
    moveToElement: (element: Node) => T,
    moveToPosition: (position: CaretPosition) => T,
  ) => T;
  match: <T> (branches: {
    remove: (element: Node) => T;
    moveToElement: (element: Node) => T;
    moveToPosition: (position: CaretPosition) => T;
  }) => T;
  log: (label: string) => void;
}

const isCompoundElement = (node: Node | undefined): boolean =>
  Type.isNonNullable(node) && (ElementType.isTableCell(SugarElement.fromDom(node)) || ElementType.isListItem(SugarElement.fromDom(node)));

const DeleteAction: {
  remove: (element: Node) => DeleteActionAdt;
  moveToElement: (element: Node) => DeleteActionAdt;
  moveToPosition: (position: CaretPosition) => DeleteActionAdt;
} = Adt.generate([
  { remove: [ 'element' ] },
  { moveToElement: [ 'element' ] },
  { moveToPosition: [ 'position' ] }
]);

const isAtContentEditableBlockCaret = (forward: boolean, from: CaretPosition): boolean => {
  const elm = from.getNode(!forward);
  const caretLocation = forward ? 'after' : 'before';
  return NodeType.isElement(elm) && elm.getAttribute('data-mce-caret') === caretLocation;
};

const isDeleteFromCefDifferentBlocks = (root: Node, forward: boolean, from: CaretPosition, to: CaretPosition, schema: Schema): boolean => {
  const inSameBlock = (elm: Element) => schema.isInline(elm.nodeName.toLowerCase()) && !CaretUtils.isInSameBlock(from, to, root);

  return CaretUtils.getRelativeCefElm(!forward, from).fold(
    () => CaretUtils.getRelativeCefElm(forward, to).fold(Fun.never, inSameBlock),
    inSameBlock
  );
};

const deleteEmptyBlockOrMoveToCef = (root: Node, forward: boolean, from: CaretPosition, to: CaretPosition): Optional<DeleteActionAdt> => {
  // TODO: TINY-8865 - This may not be safe to cast as Node below and alternative solutions need to be looked into
  const toCefElm = to.getNode(!forward) as Node;
  return DeleteUtils.getParentBlock(SugarElement.fromDom(root), SugarElement.fromDom(from.getNode() as Node)).map((blockElm) =>
    Empty.isEmpty(blockElm) ? DeleteAction.remove(blockElm.dom) : DeleteAction.moveToElement(toCefElm)
  ).orThunk(() => Optional.some(DeleteAction.moveToElement(toCefElm)));
};

const findCefPosition = (root: Node, forward: boolean, from: CaretPosition, schema: Schema): Optional<DeleteActionAdt> =>
  CaretFinder.fromPosition(forward, root, from).bind((to) => {
    if (isCompoundElement(to.getNode())) {
      return Optional.none();
    } else if (isDeleteFromCefDifferentBlocks(root, forward, from, to, schema)) {
      return Optional.none();
    } else if (forward && NodeType.isContentEditableFalse(to.getNode())) {
      return deleteEmptyBlockOrMoveToCef(root, forward, from, to);
    } else if (!forward && NodeType.isContentEditableFalse(to.getNode(true))) {
      return deleteEmptyBlockOrMoveToCef(root, forward, from, to);
    } else if (forward && isAfterContentEditableFalse(from)) {
      return Optional.some(DeleteAction.moveToPosition(to));
    } else if (!forward && isBeforeContentEditableFalse(from)) {
      return Optional.some(DeleteAction.moveToPosition(to));
    } else {
      return Optional.none();
    }
  });

const getContentEditableBlockAction = (forward: boolean, elm: Node | undefined): Optional<DeleteActionAdt> => {
  if (Type.isNullable(elm)) {
    return Optional.none();
  } else if (forward && NodeType.isContentEditableFalse(elm.nextSibling)) {
    return Optional.some(DeleteAction.moveToElement(elm.nextSibling));
  } else if (!forward && NodeType.isContentEditableFalse(elm.previousSibling)) {
    return Optional.some(DeleteAction.moveToElement(elm.previousSibling));
  } else {
    return Optional.none();
  }
};

const skipMoveToActionFromInlineCefToContent = (root: Node, from: CaretPosition, deleteAction: DeleteActionAdt): Optional<DeleteActionAdt> =>
  deleteAction.fold(
    (elm) => Optional.some(DeleteAction.remove(elm)),
    (elm) => Optional.some(DeleteAction.moveToElement(elm)),
    (to) => {
      if (CaretUtils.isInSameBlock(from, to, root)) {
        return Optional.none();
      } else {
        return Optional.some(DeleteAction.moveToPosition(to));
      }
    }
  );

const getContentEditableAction = (root: Node, forward: boolean, from: CaretPosition, schema: Schema): Optional<DeleteActionAdt> => {
  if (isAtContentEditableBlockCaret(forward, from)) {
    return getContentEditableBlockAction(forward, from.getNode(!forward))
      .orThunk(() => findCefPosition(root, forward, from, schema));
  } else {
    return findCefPosition(root, forward, from, schema).bind((deleteAction) =>
      skipMoveToActionFromInlineCefToContent(root, from, deleteAction)
    );
  }
};

const read = (root: Node, forward: boolean, rng: Range, schema: Schema): Optional<DeleteActionAdt> => {
  const normalizedRange = CaretUtils.normalizeRange(forward ? 1 : -1, root, rng);
  const from = CaretPosition.fromRangeStart(normalizedRange);
  const rootElement = SugarElement.fromDom(root);

  // TODO: TINY-8865 - This may not be safe to cast as Node below and alternative solutions need to be looked into
  if (!forward && isAfterContentEditableFalse(from)) {
    return Optional.some(DeleteAction.remove(from.getNode(true) as Node));
  } else if (forward && isBeforeContentEditableFalse(from)) {
    return Optional.some(DeleteAction.remove(from.getNode() as Node));
  } else if (!forward && isBeforeContentEditableFalse(from) && isAfterBr(rootElement, from, schema)) {
    return findPreviousBr(rootElement, from, schema).map((br) => DeleteAction.remove(br.getNode() as Node));
  } else if (forward && isAfterContentEditableFalse(from) && isBeforeBr(rootElement, from, schema)) {
    return findNextBr(rootElement, from, schema).map((br) => DeleteAction.remove(br.getNode() as Node));
  } else {
    return getContentEditableAction(root, forward, from, schema);
  }
};

export {
  read
};
