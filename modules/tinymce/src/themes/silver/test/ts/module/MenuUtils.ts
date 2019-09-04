import { Chain, GeneralSteps, Logger, Mouse, UiFinder } from '@ephox/agar';
import { Body } from '@ephox/sugar';

import { ToolbarDrawer } from 'tinymce/themes/silver/api/Settings';

export interface OpenNestedMenus {
  label: string;
  selector: string;
}

const sOpenMenuWithSelector = (label: string, selector: string) => {
  return Logger.t(
    `Trying to open menu: ${label}`,
    GeneralSteps.sequence([
      Mouse.sClickOn(Body.body(), selector),
      Chain.asStep(Body.body(), [
        UiFinder.cWaitForVisible('Waiting for menu', '[role="menu"]')
      ]),
    ])
  );
};

const sOpenMore = (type: ToolbarDrawer) => {
  // type floating or sliding
  const slidingClass = 'div.tox-toolbar__overflow--open:not(.tox-toolbar__overflow--growing)';
  const floatingClass = 'div.tox-toolbar__overflow';
  const selector = type === ToolbarDrawer.sliding ? slidingClass : floatingClass;

  return Logger.t(
    `Trying to open more drawer`,
    GeneralSteps.sequence([
      Mouse.sClickOn(Body.body(), 'button[title="More..."]'),
      Chain.asStep(Body.body(), [
        UiFinder.cWaitForVisible('Waiting for more drawer to open', selector)
      ]),
    ])
  );
};

const sOpenAlignMenu = (label: string) => {
  const selector = `button[aria-label="Align"]`;
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
  const openMenusSequence = menus.map((menu) => {
    return sOpenMenuWithSelector(menu.label, menu.selector);
  });
  return GeneralSteps.sequence(openMenusSequence);
};

export {
  // generic methods
  sOpenMenuWithSelector,
  sOpenMenu,
  sOpenNestedMenus,

  // specific pre-composed
  sOpenAlignMenu,
  sOpenMore
};
