import { Cell, Optional } from '@ephox/katamari';

import * as CaretContainer from '../caret/CaretContainer';
import * as CaretContainerInline from '../caret/CaretContainerInline';
import * as CaretContainerRemove from '../caret/CaretContainerRemove';
import * as CaretFinder from '../caret/CaretFinder';
import CaretPosition from '../caret/CaretPosition';
import * as NodeType from '../dom/NodeType';
import { LocationAdt } from './BoundaryLocation';

const insertInlinePos = (pos: CaretPosition, before: boolean) => {
  if (NodeType.isText(pos.container())) {
    return CaretContainerInline.insertInline(before, pos.container());
  } else {
    // TODO: TINY-8865 - This may not be safe to cast as Node and alternative solutions need to be looked into
    return CaretContainerInline.insertInline(before, pos.getNode() as Node);
  }
};

const isPosCaretContainer = (pos: CaretPosition, caret: Cell<Text | null>) => {
  const caretNode = caret.get();
  return caretNode && pos.container() === caretNode && CaretContainer.isCaretContainerInline(caretNode);
};

const renderCaret = (caret: Cell<Text | null>, location: LocationAdt): Optional<CaretPosition> =>
  location.fold(
    (element) => { // Before
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineBefore(element);
      caret.set(text);
      return Optional.some(CaretPosition(text, text.length - 1));
    },
    (element) => // Start
      CaretFinder.firstPositionIn(element).map((pos) => {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, true);
          caret.set(text);
          return CaretPosition(text, 1);
        } else {
          const node = caret.get() as Text;
          return CaretPosition(node, 1);
        }
      }),
    (element) => // End
      CaretFinder.lastPositionIn(element).map((pos) => {
        if (!isPosCaretContainer(pos, caret)) {
          CaretContainerRemove.remove(caret.get());
          const text = insertInlinePos(pos, false);
          caret.set(text);
          return CaretPosition(text, text.length - 1);
        } else {
          const node = caret.get() as Text;
          return CaretPosition(node, node.length - 1);
        }
      }),
    (element) => { // After
      CaretContainerRemove.remove(caret.get());
      const text = CaretContainerInline.insertInlineAfter(element);
      caret.set(text);
      return Optional.some(CaretPosition(text, 1));
    }
  );

export {
  renderCaret
};
