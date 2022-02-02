import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Scroll, SugarBody, SugarElement } from '@ephox/sugar';
import { TinyDom } from '@ephox/wrap-mcagar';

import Editor from 'tinymce/core/api/Editor';

const countNumber = (container: SugarElement<Node>, selector: string) => {
  const ts = UiFinder.findAllIn(container, selector);
  return ts.length;
};

const extractOnlyOne = (container: SugarElement<Node>, selector: string) => {
  const ts = UiFinder.findAllIn(container, selector);
  if (ts.length === 1) {
    return ts[0];
  } else {
    throw new Error('Did not find exactly 1 of ' + selector + '. Found: ' + ts.length);
  }
};

const resizeToPos = (sx: number, sy: number, dx: number, dy: number, delta: number = 10) => {
  // Simulate moving the mouse, by making a number of movements
  const numMoves = sy === dy ? Math.abs(dx - sx) / delta : Math.abs(dy - sy) / delta;
  // Determine the deltas based on the number of moves to make
  const deltaX = (dx - sx) / numMoves;
  const deltaY = (dy - sy) / numMoves;
  // Move and release the mouse
  const blocker = UiFinder.findIn(SugarBody.body(), '.tox-blocker').getOrDie();
  Mouse.mouseMoveTo(blocker, sx, sy);
  Arr.range(numMoves, (count) => {
    const nx = sx + count * deltaX;
    const ny = sy + count * deltaY;
    return Mouse.mouseMoveTo(blocker, nx, ny);
  });
  Mouse.mouseMoveTo(blocker, dx, dy);
  Mouse.mouseUp(blocker);
};

const scrollRelativeEditor = (editor: Editor, relative: 'top' | 'bottom' = 'top', deltaY: number) => {
  const target = editor.inline ? TinyDom.body(editor) : TinyDom.container(editor);
  target.dom.scrollIntoView(relative === 'top');
  Scroll.to(0, window.pageYOffset + deltaY);
};

const pWaitForEditorToRender = () =>
  Waiter.pTryUntil('Editor has rendered', () => UiFinder.exists(SugarBody.body(), '.tox-editor-header'));

export {
  countNumber,
  extractOnlyOne,
  resizeToPos,
  scrollRelativeEditor,
  pWaitForEditorToRender
};
