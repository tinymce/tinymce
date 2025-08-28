import { Menu as BridgeMenu } from '@ephox/bridge';
import { Arr, Fun, Optional, Strings } from '@ephox/katamari';

import { LinkInformation } from '../../backstage/UrlInputBackstage';
import { LinkTarget, LinkTargetType } from '../core/LinkTargets';
import { SingleMenuItemSpec } from '../menus/menu/SingleMenuTypes';

const separator: BridgeMenu.SeparatorMenuItemSpec = {
  type: 'separator'
};

const toMenuItem = (target: LinkTarget): BridgeMenu.MenuItemSpec => ({
  type: 'menuitem',
  value: target.url,
  text: target.title,
  meta: {
    attach: target.attach
  },
  onAction: Fun.noop
});

const staticMenuItem = (title: string, url: string): BridgeMenu.MenuItemSpec => ({
  type: 'menuitem',
  value: url,
  text: title,
  meta: {
    attach: undefined
  },
  onAction: Fun.noop
});

const toMenuItems = (targets: LinkTarget[]): BridgeMenu.MenuItemSpec[] =>
  Arr.map(targets, toMenuItem);

const filterLinkTargets = (type: LinkTargetType, targets: LinkTarget[]): LinkTarget[] =>
  Arr.filter(targets, (target) => target.type === type);

const filteredTargets = (type: LinkTargetType, targets: LinkTarget[]): BridgeMenu.MenuItemSpec[] =>
  toMenuItems(filterLinkTargets(type, targets));

const headerTargets = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  filteredTargets('header', linkInfo.targets);

const anchorTargets = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  filteredTargets('anchor', linkInfo.targets);

const anchorTargetTop = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  Optional.from(linkInfo.anchorTop).map((url) => staticMenuItem('<top>', url)).toArray();

const anchorTargetBottom = (linkInfo: LinkInformation): BridgeMenu.MenuItemSpec[] =>
  Optional.from(linkInfo.anchorBottom).map((url) => staticMenuItem('<bottom>', url)).toArray();

const historyTargets = (history: string[]): BridgeMenu.MenuItemSpec[] =>
  Arr.map(history, (url) => staticMenuItem(url, url));

const joinMenuLists = (items: BridgeMenu.MenuItemSpec[][]): SingleMenuItemSpec[] => {
  return Arr.foldl(items, (a, b) => {
    const bothEmpty = a.length === 0 || b.length === 0;
    return bothEmpty ? a.concat(b) : a.concat(separator, b);
  }, [] as SingleMenuItemSpec[]);
};

const filterByQuery = (term: string, menuItems: BridgeMenu.MenuItemSpec[]): BridgeMenu.MenuItemSpec[] => {
  const lowerCaseTerm = term.toLowerCase();
  return Arr.filter(menuItems, (item) => {
    const text = item.meta !== undefined && item.meta.text !== undefined ? item.meta.text : item.text;
    const value = item.value ?? '';
    return Strings.contains(text.toLowerCase(), lowerCaseTerm) || Strings.contains(value.toLowerCase(), lowerCaseTerm);
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
