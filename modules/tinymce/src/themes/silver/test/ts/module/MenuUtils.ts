import { Assertions, Chain, GeneralSteps, Logger, Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { Body } from '@ephox/sugar';

import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';

export interface OpenNestedMenus {
  label: string;
  selector: string;
}

const getToolbarSelector = (type: ToolbarMode, opening: boolean) => {
  // type floating or sliding
  const slidingMode = opening ? 'growing' : 'shrinking';
  const slidingClass = `div.tox-toolbar__overflow--open:not(.tox-toolbar__overflow--${slidingMode})`;
  const floatingClass = 'div.tox-toolbar__overflow';
  return type === ToolbarMode.sliding ? slidingClass : floatingClass;
};

const sOpenMenuWithSelector = (label: string, selector: string) => Logger.t(
  `Trying to open menu: ${label}`,
  GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), selector),
    Chain.asStep(Body.body(), [
      UiFinder.cWaitForVisible('Waiting for menu', '[role="menu"]')
    ])
  ])
);

const sOpenMore = (type: ToolbarMode) => Logger.t(
  'Trying to open more drawer',
  GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), 'button[title="More..."]'),
    UiFinder.sWaitForVisible('Waiting for more drawer to open', Body.body(), getToolbarSelector(type, true))
  ])
);

const sCloseMore = (type: ToolbarMode) => Logger.t(
  'Trying to close more drawer',
  GeneralSteps.sequence([
    Mouse.sClickOn(Body.body(), 'button[title="More..."]'),
    Waiter.sTryUntil('Waiting for more drawer to close', UiFinder.sNotExists(Body.body(), getToolbarSelector(type, false)))
  ])
);

const sOpenAlignMenu = (label: string) => {
  const selector = 'button[aria-label="Align"]';
  return sOpenMenuWithSelector(label, selector);
};

const sOpenMenu = (label: string, menuText: string) => {
  const menuTextParts = menuText.indexOf(':') > -1 ? menuText.split(':') : [ menuText ];
  const btnText = menuTextParts[0];
  const pseudo = menuTextParts.length > 1 ? ':' + menuTextParts[1] : '';
  const selector = `button:contains(${btnText})${pseudo}`;
  return sOpenMenuWithSelector(label, selector);
};

const sOpenNestedMenus = (menus: OpenNestedMenus[]) => {
  const openMenusSequence = menus.map((menu) => sOpenMenuWithSelector(menu.label, menu.selector));
  return GeneralSteps.sequence(openMenusSequence);
};

const sAssertMoreDrawerInViewport = (type: ToolbarMode) => Chain.asStep(Body.body(), [
  UiFinder.cFindIn(getToolbarSelector(type, true)),
  Chain.op((drawer) => {
    const winBox = Boxes.win();
    const drawerBox = Boxes.box(drawer);
    // -1 from the bottom to account for the negative margin
    const inViewport = drawerBox.x >= winBox.x && drawerBox.bottom - 1 <= winBox.bottom;
    Assertions.assertEq('Check more drawer is shown within the viewport', inViewport, true);
  })
]);

export {
  // generic methods
  sOpenMenuWithSelector,
  sOpenMenu,
  sOpenNestedMenus,

  // specific pre-composed
  sOpenAlignMenu,
  sOpenMore,
  sCloseMore,
  sAssertMoreDrawerInViewport
};
