import { Pointer, UiFinder, Waiter } from '@ephox/agar';
import { Arr } from '@ephox/katamari';
import { Css, SugarBody, type SugarElement } from '@ephox/sugar';

const requestedWidthProperty = '--tox-private-requested-sidebar-width';

const getSidebar = (): SugarElement<HTMLElement> =>
  UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-sidebar').getOrDie();

const getSidebarRequestedWidth = (): number => {
  const raw = Css.getRaw(getSidebar(), requestedWidthProperty)
    .getOrDie(`Expected the sidebar to have the ${requestedWidthProperty} custom property set`);
  return parseInt(raw, 10);
};

const getSidebarResizeHandle = (): SugarElement<HTMLElement> =>
  UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-sidebar__resize-handle').getOrDie();

const getEditArea = (): SugarElement<HTMLElement> =>
  UiFinder.findIn<HTMLElement>(SugarBody.body(), '.tox-edit-area').getOrDie();

const pWaitForSidebarOpen = (): Promise<void> =>
  Waiter.pTryUntil('Waiting for the sidebar to finish opening', () => {
    UiFinder.exists(SugarBody.body(), '.tox-sidebar--sliding-open');
    UiFinder.notExists(SugarBody.body(), '.tox-sidebar--sliding-growing');
  });

const pWaitForSidebarClosed = (): Promise<void> =>
  Waiter.pTryUntil('Waiting for the sidebar to finish closing', () => {
    UiFinder.exists(SugarBody.body(), '.tox-sidebar--sliding-closed');
    UiFinder.notExists(SugarBody.body(), '.tox-sidebar--sliding-shrinking');
  });

const resizeSidebarBy = async (vector: [ number, number ], delta = 10): Promise<void> => {
  // Simulate moving the mouse, by making a number of movements
  const numMoves = vector[1] === 0 ? Math.abs(vector[0]) / delta : Math.abs(vector[1]) / delta;

  // Determine the deltas based on the number of moves to make
  const deltaX = vector[0] / numMoves;
  const deltaY = vector[1] / numMoves;

  const resizeHandle = getSidebarResizeHandle();

  await Pointer.pWithMockPointerCapture(resizeHandle, {}, () => {
    Pointer.pointerDown(resizeHandle);
    Pointer.pointerMoveBy(resizeHandle, 0, 0);
    Arr.range(numMoves, () => {
      Pointer.pointerMoveBy(resizeHandle, deltaX, deltaY);
    });
    Pointer.pointerUp(resizeHandle);
  });
};

export {
  getSidebar,
  getSidebarRequestedWidth,
  getSidebarResizeHandle,
  getEditArea,
  pWaitForSidebarOpen,
  pWaitForSidebarClosed,
  resizeSidebarBy
};
