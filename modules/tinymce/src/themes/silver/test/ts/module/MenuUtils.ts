import { Mouse, UiFinder, Waiter } from '@ephox/agar';
import { Boxes } from '@ephox/alloy';
import { Arr } from '@ephox/katamari';
import { SugarBody } from '@ephox/sugar';
import { assert } from 'chai';

import { ToolbarMode } from 'tinymce/themes/silver/api/Options';

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

const pOpenMenuWithSelector = async (label: string, selector: string): Promise<void> => {
  Mouse.clickOn(SugarBody.body(), selector);
  await UiFinder.pWaitForVisible(`Waiting for menu: ${label}`, SugarBody.body(), '[role="menu"]');
};

const pOpenMore = async (type: ToolbarMode): Promise<void> => {
  Mouse.clickOn(SugarBody.body(), 'button[title="Reveal or hide additional toolbar items"]');
  await UiFinder.pWaitForVisible('Waiting for more drawer to open', SugarBody.body(), getToolbarSelector(type, true));
};

const pCloseMore = async (type: ToolbarMode): Promise<void> => {
  Mouse.clickOn(SugarBody.body(), 'button[title="Reveal or hide additional toolbar items"]');
  await Waiter.pTryUntil('Waiting for more drawer to close', () => UiFinder.notExists(SugarBody.body(), getToolbarSelector(type, false)));
};

const pOpenAlignMenu = (label: string): Promise<void> => {
  const selector = 'button[aria-label^="Align"].tox-tbtn--select';
  return pOpenMenuWithSelector(label, selector);
};

const pOpenMenu = (label: string, menuText: string): Promise<void> => {
  const menuTextParts = menuText.indexOf(':') > -1 ? menuText.split(':') : [ menuText ];
  const btnText = menuTextParts[0];
  const pseudo = menuTextParts.length > 1 ? ':' + menuTextParts[1] : '';
  const selector = `button:contains(${btnText})${pseudo}`;
  return pOpenMenuWithSelector(label, selector);
};

const pOpenNestedMenus = (menus: OpenNestedMenus[]): Promise<void> =>
  Arr.foldl(menus, (p, menu) => p.then(async () => {
    await pOpenMenuWithSelector(menu.label, menu.selector);
  }), Promise.resolve());

const assertMoreDrawerInViewport = (type: ToolbarMode): void => {
  const toolbar = UiFinder.findIn<HTMLDivElement>(SugarBody.body(), getToolbarSelector(type, true)).getOrDie();
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
