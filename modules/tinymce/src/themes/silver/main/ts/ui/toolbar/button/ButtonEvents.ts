/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { AlloyEvents, AlloyTriggers, CustomEvent, SystemEvents } from '@ephox/alloy';
import { Id } from '@ephox/katamari';
import { GetApiType, runWithApi } from '../../controls/Controls';

export interface OnMenuItemExecuteType<T> extends GetApiType<T> {
  readonly onAction: (itemApi: T) => void;
}

export const internalToolbarButtonExecute = Id.generate('toolbar.button.execute');

export interface InternalToolbarButtonExecuteEvent<T> extends CustomEvent {
  readonly buttonApi: T;
}

// Perform `action` when an item is clicked on, close menus, and stop event
const onToolbarButtonExecute = <T>(info: OnMenuItemExecuteType<T>) => AlloyEvents.runOnExecute((comp, _simulatedEvent) => {
  // If there is an action, run the action
  runWithApi(info, comp)((itemApi: T) => {
    AlloyTriggers.emitWith(comp, internalToolbarButtonExecute, {
      buttonApi: itemApi
    });
    info.onAction(itemApi);
  });
});

const toolbarButtonEventOrder = {
  // TODO: use the constants provided by behaviours.
  [SystemEvents.execute()]: [ 'disabling', 'alloy.base.behaviour', 'toggling', 'toolbar-button-events' ]
};

export { onToolbarButtonExecute, toolbarButtonEventOrder, runWithApi };
