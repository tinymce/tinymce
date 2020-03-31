/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, AlloyTriggers, SystemEvents } from '@ephox/alloy';
import { Menu } from '@ephox/bridge';
import { GetApiType, runWithApi } from '../../controls/Controls';
import ItemResponse from './ItemResponse';

export type GeneralMenuItemInstanceApi = Menu.MenuItemInstanceApi | Menu.ToggleMenuItemInstanceApi | Menu.ChoiceMenuItemInstanceApi;
export type GeneralMenuItem = Menu.MenuItem | Menu.ToggleMenuItem | Menu.ChoiceMenuItem;

export interface OnMenuItemExecuteType<T> extends GetApiType<T> {
  onAction: (itemApi: T) => void;
  triggersSubmenu: boolean;
}

// Perform `action` when an item is clicked on, close menus, and stop event
const onMenuItemExecute = <T>(info: OnMenuItemExecuteType<T>, itemResponse: ItemResponse) => AlloyEvents.runOnExecute(function (comp, simulatedEvent) {
  // If there is an action, run the action
  runWithApi(info, comp)(info.onAction);
  if (! info.triggersSubmenu && itemResponse === ItemResponse.CLOSE_ON_EXECUTE) {
    AlloyTriggers.emit(comp, SystemEvents.sandboxClose());
    simulatedEvent.stop();
  }
});

const menuItemEventOrder = {
  // TODO: use the constants provided by behaviours.
  'alloy.execute': [ 'disabling', 'alloy.base.behaviour', 'toggling', 'item-events' ]
};

export { onMenuItemExecute, menuItemEventOrder };
