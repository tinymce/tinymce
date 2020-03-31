/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Menu as BridgeMenu } from '@ephox/bridge';
import { Arr, Strings, Option } from '@ephox/katamari';

import { LinkTarget, LinkTargetType } from '../core/LinkTargets';
import { LinkInformation } from '../../backstage/UrlInputBackstage';
import { SingleMenuItemApi } from '../menus/menu/SingleMenuTypes';

const separator: BridgeMenu.SeparatorMenuItemApi = {
  type: 'separator'
};

const toMenuItem = (target: LinkTarget): BridgeMenu.MenuItemApi => ({
  type: 'menuitem',
  value: target.url,
  text: target.title,
  meta: {
    attach: target.attach
  },
  onAction: () => { }
});

const staticMenuItem = (title: string, url: string): BridgeMenu.MenuItemApi => ({
  type: 'menuitem',
  value: url,
  text: title,
  meta: {
    attach: undefined
  },
  onAction: () => { }
});

const toMenuItems = (targets: LinkTarget[]): BridgeMenu.MenuItemApi[] =>
  Arr.map(targets, toMenuItem);

const filterLinkTargets = (type: LinkTargetType, targets: LinkTarget[]): LinkTarget[] =>
  Arr.filter(targets, (target) => target.type === type);

const filteredTargets = (type: LinkTargetType, targets: LinkTarget[]) =>
  toMenuItems(filterLinkTargets(type, targets));

const headerTargets = (linkInfo: LinkInformation) => filteredTargets('header', linkInfo.targets);

const anchorTargets = (linkInfo: LinkInformation) => filteredTargets('anchor', linkInfo.targets);

const anchorTargetTop = (linkInfo: LinkInformation) => Option.from(linkInfo.anchorTop).map((url) => staticMenuItem('<top>', url)).toArray();

const anchorTargetBottom = (linkInfo: LinkInformation) => Option.from(linkInfo.anchorBottom).map((url) => staticMenuItem('<bottom>', url)).toArray();

const historyTargets = (history: string[]) => Arr.map(history, (url) => staticMenuItem(url, url));

const joinMenuLists = function (items: BridgeMenu.MenuItemApi[][]) {
  return Arr.foldl(items, function (a, b) {
    const bothEmpty = a.length === 0 || b.length === 0;
    return bothEmpty ? a.concat(b) : a.concat(separator, b);
  }, <SingleMenuItemApi[]> []);
};

const filterByQuery = function (term: string, menuItems: BridgeMenu.MenuItemApi[]) {
  const lowerCaseTerm = term.toLowerCase();
  return Arr.filter(menuItems, function (item) {
    const text = item.meta !== undefined && item.meta.text !== undefined ? item.meta.text : item.text;
    return Strings.contains(text.toLowerCase(), lowerCaseTerm) || Strings.contains(item.value.toLowerCase(), lowerCaseTerm);
  });
};

export {
  separator,
  toMenuItem,
  staticMenuItem,
  toMenuItems,
  filterLinkTargets,
  filteredTargets,
  headerTargets,
  anchorTargets,
  anchorTargetTop,
  anchorTargetBottom,
  historyTargets,
  joinMenuLists,
  filterByQuery
};