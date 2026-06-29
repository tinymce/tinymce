import { Pointer, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Scroll, SugarBody, type SugarElement } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';

import type Editor from 'tinymce/core/api/Editor';

const countNumber = (container: SugarElement<Node>, selector: string): number => {
  const ts = UiFinder.findAllIn(container, selector);
  return ts.length;
};

const extractOnlyOne = (container: SugarElement<Node>, selector: string): SugarElement<HTMLElement> => {
  const ts = UiFinder.findAllIn<HTMLElement>(container, selector);
  if (ts.length === 1) {
    return ts[0];
  } else {
    throw new Error('Did not find exactly 1 of ' + selector + '. Found: ' + ts.length);
  }
};

const resizeEditorBy = async (vector: [ number, number ], delta = 10): Promise<void> => {
  // Simulate moving the mouse, by making a number of movements
  const numMoves = vector[1] === 0 ? Math.abs(vector[0]) / delta : Math.abs(vector[1]) / delta;

  // Determine the deltas based on the number of moves to make
  const deltaX = vector[0] / numMoves;
  const deltaY = vector[1] / numMoves;

  const resizeHandle = UiFinder.findIn(SugarBody.body(), '.tox-statusbar__resize-handle').getOrDie();

  await Pointer.pWithMockPointerCapture(resizeHandle, {}, () => {
    Pointer.pointerDown(resizeHandle);
    Pointer.pointerMoveBy(resizeHandle, 0, 0);
    Arr.range(numMoves, () => {
      Pointer.pointerMoveBy(resizeHandle, deltaX, deltaY);
    });
    Pointer.pointerUp(resizeHandle);
  });
};

const scrollRelativeEditor = (editor: Editor, relative: 'top' | 'bottom' = 'top', deltaY: number): void => {
  const target = editor.inline ? TinyDom.body(editor) : TinyDom.container(editor);
  target.dom.scrollIntoView(relative === 'top');
  Scroll.to(0, window.pageYOffset + deltaY);
};

const pWaitForEditorToRender = (): Promise<void> =>
  Waiter.pTryUntil('Editor has rendered', () => UiFinder.exists(SugarBody.body(), '.tox-editor-header'));

export {
  countNumber,
  extractOnlyOne,
  resizeEditorBy,
  scrollRelativeEditor,
  pWaitForEditorToRender
};
