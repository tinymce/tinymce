import { Fun } from '@ephox/katamari';

import * as Dimensions from '../dom/Dimensions';
import * as ClientRect from '../geom/ClientRect';
import * as ArrUtils from '../util/ArrUtils';
import * as CaretCandidate from './CaretCandidate';
import CaretPosition from './CaretPosition';
import * as CaretUtils from './CaretUtils';
import { CaretWalker } from './CaretWalker';

type GeomClientRect = ClientRect.ClientRect;

interface LineClientRect extends GeomClientRect {
  line: number;
}

export interface LinePosClientRect extends LineClientRect {
  position: CaretPosition;
}

export interface LineNodeClientRect extends Dimensions.NodeClientRect, LineClientRect { }

export enum VDirection {
  Up = -1,
  Down = 1
}

type PosPredicate = (rect1: GeomClientRect, rect2: GeomClientRect) => boolean;
type RectPredicate<T extends GeomClientRect> = (rect: T) => boolean;

const findUntil = (direction: VDirection, root: Node, predicateFn: (node: Node) => boolean, node: Node): void => {
  let currentNode: Node | null = node;
  while ((currentNode = CaretUtils.findNode(currentNode, direction, CaretCandidate.isEditableCaretCandidate, root))) {
    if (predicateFn(currentNode)) {
      return;
    }
  }
};

const walkUntil = (direction: VDirection, isAboveFn: PosPredicate, isBeflowFn: PosPredicate, root: Node, predicateFn: RectPredicate<LineNodeClientRect>, caretPosition: CaretPosition): LineNodeClientRect[] => {
  let line = 0;
  const result: LineNodeClientRect[] = [];

  const add = (node: Node): boolean => {

    let clientRects = Dimensions.getClientRects([ node ]);
    if (direction === -1) {
      clientRects = clientRects.reverse();
    }

    for (let i = 0; i < clientRects.length; i++) {
      const clientRect = clientRects[i] as LineNodeClientRect;
      if (isBeflowFn(clientRect, targetClientRect as ClientRect)) {
        continue;
      }

      if (result.length > 0 && isAboveFn(clientRect, ArrUtils.last(result) as LineClientRect)) {
        line++;
      }

      clientRect.line = line;

      if (predicateFn(clientRect)) {
        return true;
      }

      result.push(clientRect);
    }

    return false;
  };

  const targetClientRect = ArrUtils.last(caretPosition.getClientRects());
  if (!targetClientRect) {
    return result;
  }

  const node = caretPosition.getNode();
  if (node) {
    add(node);
    findUntil(direction, root, add, node);
  }

  return result;
};

const aboveLineNumber = <T extends LineClientRect>(lineNumber: number, clientRect: T): boolean =>
  clientRect.line > lineNumber;

const isLineNumber = <T extends LineClientRect>(lineNumber: number, clientRect: T): boolean =>
  clientRect.line === lineNumber;

const upUntil: (root: Node, predicateFn: RectPredicate<LineNodeClientRect>, caretPosition: CaretPosition) => LineNodeClientRect[] =
  Fun.curry(walkUntil, VDirection.Up, ClientRect.isAbove, ClientRect.isBelow);

const downUntil: (root: Node, predicateFn: RectPredicate<LineNodeClientRect>, caretPosition: CaretPosition) => LineNodeClientRect[] =
  Fun.curry(walkUntil, VDirection.Down, ClientRect.isBelow, ClientRect.isAbove);

const getLastClientRect = (caretPosition: CaretPosition): ClientRect => {
  // ASSUMPTION: There should always be at least one client rect here
  return ArrUtils.last(caretPosition.getClientRects()) as ClientRect;
};

const positionsUntil = (direction: VDirection, root: Node, predicateFn: RectPredicate<LinePosClientRect>, node: Node): LinePosClientRect[] => {
  const caretWalker = CaretWalker(root);
  let walkFn: (caretPosition: CaretPosition | null) => CaretPosition | null;
  let isBelowFn: PosPredicate;
  let isAboveFn: PosPredicate;
  let caretPosition: CaretPosition | null;
  const result: LinePosClientRect[] = [];
  let line = 0;

  if (direction === 1) {
    walkFn = caretWalker.next;
    isBelowFn = ClientRect.isBelow;
    isAboveFn = ClientRect.isAbove;
    caretPosition = CaretPosition.after(node);
  } else {
    walkFn = caretWalker.prev;
    isBelowFn = ClientRect.isAbove;
    isAboveFn = ClientRect.isBelow;
    caretPosition = CaretPosition.before(node);
  }

  const targetClientRect = getLastClientRect(caretPosition);

  do {
    if (!caretPosition.isVisible()) {
      continue;
    }

    const rect = getLastClientRect(caretPosition);

    if (isAboveFn(rect, targetClientRect)) {
      continue;
    }

    if (result.length > 0 && isBelowFn(rect, ArrUtils.last(result) as LineClientRect)) {
      line++;
    }

    const clientRect = ClientRect.clone(rect) as LinePosClientRect;
    clientRect.position = caretPosition;
    clientRect.line = line;

    if (predicateFn(clientRect)) {
      return result;
    }

    result.push(clientRect);
  } while ((caretPosition = walkFn(caretPosition)));

  return result;
};

const isAboveLine = (lineNumber: number) => <T extends LineClientRect>(clientRect: T): boolean => aboveLineNumber(lineNumber, clientRect);
const isLine = (lineNumber: number) => <T extends LineClientRect>(clientRect: T): boolean => isLineNumber(lineNumber, clientRect);

export {
  upUntil,
  downUntil,
  positionsUntil,
  isAboveLine,
  isLine
};
