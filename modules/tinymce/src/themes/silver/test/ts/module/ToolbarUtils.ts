import { Assertions, Chain, GeneralSteps, Step } from '@ephox/agar';
import { TinyUi } from '@ephox/mcagar';
import { Body, Height, Location, Width } from '@ephox/sugar';

import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';
import { sCloseMore, sOpenMore } from './MenuUtils';

const sAssertFloatingToolbarPosition = (tinyUi: TinyUi, getTop: () => number, expectedLeft: number, expectedRight: number) => Chain.asStep(Body.body(), [
  tinyUi.cWaitForUi('Wait for drawer to be visible', '.tox-toolbar__overflow'),
  Chain.op((toolbar) => {
    const top = getTop();
    const diff = 10;
    const pos = Location.absolute(toolbar);
    const right = pos.left() + Width.get(toolbar);
    Assertions.assertEq(`Drawer top position ${pos.top()}px should be ~${top}px`, true, Math.abs(pos.top() - top) < diff);
    Assertions.assertEq(`Drawer left position ${pos.left()}px should be ~${expectedLeft}px`, true, Math.abs(pos.left() - expectedLeft) < diff);
    Assertions.assertEq(`Drawer right position ${right}px should be ~${expectedRight}px`, true, Math.abs(right - expectedRight) < diff);
  })
]);

const sAssertFloatingToolbarHeight = (tinyUi: TinyUi, expectedHeight: number) => Chain.asStep(Body.body(), [
  tinyUi.cWaitForUi('Wait for drawer to be visible', '.tox-toolbar__overflow'),
  Chain.op((toolbar) => {
    const height = Height.get(toolbar);
    Assertions.assertEq(`Drawer height ${height}px should be ~${expectedHeight}px`, true, Math.abs(height - expectedHeight) <= 1);
  })
]);

const sOpenFloatingToolbarAndAssertPosition = (tinyUi: TinyUi, getTop: () => number, additionalSteps: Array<Step<any, any>> = []) => GeneralSteps.sequence([
  sOpenMore(ToolbarMode.floating),
  sAssertFloatingToolbarPosition(tinyUi, getTop, 105, 465),
  ...additionalSteps,
  sCloseMore(ToolbarMode.floating)
]);

export {
  sAssertFloatingToolbarHeight,
  sAssertFloatingToolbarPosition,
  sOpenFloatingToolbarAndAssertPosition
};
