import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import PromisePolyfill from 'tinymce/core/api/util/Promise';
import { ToolbarMode } from 'tinymce/themes/silver/api/Settings';

export interface OpenNestedMenus {
  readonly label: string;
  readonly selector: string;
}

const getToolbarSelector = (type: ToolbarMode, opening: boolean) => {
  // type floating or sliding
  const slidingMode = opening ? 'growing' : 'shrinking';
  const slidingClass = `div.tox-toolbar__overflow--open:not(.tox-toolbar__overflow--${slidingMode})`;
  const floatingClass = 'div.tox-toolbar__overflow';
  return type === ToolbarMode.sliding ? slidingClass : floatingClass;
};

const pOpenMenuWithSelector = async (label: string, selector: string) => {
  Mouse.clickOn(SugarBody.body(), selector);
  await UiFinder.pWaitForVisible(`Waiting for menu: ${label}`, SugarBody.body(), '[role="menu"]');
};

const pOpenMore = async (type: ToolbarMode) => {
  Mouse.clickOn(SugarBody.body(), 'button[title="More..."]');
  await UiFinder.pWaitForVisible('Waiting for more drawer to open', SugarBody.body(), getToolbarSelector(type, true));
};

const pCloseMore = async (type: ToolbarMode) => {
  Mouse.clickOn(SugarBody.body(), 'button[title="More..."]');
  await Waiter.pTryUntil('Waiting for more drawer to close', () => UiFinder.notExists(SugarBody.body(), getToolbarSelector(type, false)));
};

const pOpenAlignMenu = (label: string) => {
  const selector = 'button[aria-label="Align"]';
  return pOpenMenuWithSelector(label, selector);
};

const pOpenMenu = (label: string, menuText: string) => {
  const menuTextParts = menuText.indexOf(':') > -1 ? menuText.split(':') : [ menuText ];
  const btnText = menuTextParts[0];
  const pseudo = menuTextParts.length > 1 ? ':' + menuTextParts[1] : '';
  const selector = `button:contains(${btnText})${pseudo}`;
  return pOpenMenuWithSelector(label, selector);
};

const pOpenNestedMenus = (menus: OpenNestedMenus[]) =>
  Arr.foldl(menus, (p, menu) => p.then(async () => {
    await pOpenMenuWithSelector(menu.label, menu.selector);
  }), PromisePolyfill.resolve());

const assertMoreDrawerInViewport = (type: ToolbarMode) => {
  const toolbar = UiFinder.findIn(SugarBody.body(), getToolbarSelector(type, true)).getOrDie();
  const winBox = Boxes.win();
  const drawerBox = Boxes.box(toolbar);
  // -1 from the bottom to account for the negative margin
  const inViewport = drawerBox.x >= winBox.x && drawerBox.bottom - 1 <= winBox.bottom;
  assert.isTrue(inViewport, 'Check more drawer is shown within the viewport');
};

export {
  // generic methods
  pOpenMenuWithSelector,
  pOpenMenu,
  pOpenNestedMenus,

  // specific pre-composed
  pOpenAlignMenu,
  pOpenMore,
  pCloseMore,
  assertMoreDrawerInViewport
};
