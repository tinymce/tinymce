/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, AlloyTriggers, Behaviour, DomFactory, GuiFactory, ModalDialog, Receiving, Reflecting,
  SystemEvents
} from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Arr, Cell, Optional } from '@ephox/katamari';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { StoragedMenuButton, StoragedMenuItem } from '../button/MenuButton';
import * as Dialogs from '../dialog/Dialogs';
import { FormBlockEvent, formCancelEvent } from '../general/FormEvents';
import { dialogChannel } from './DialogChannels';
import { renderModalHeader } from './SilverDialogHeader';

export interface WindowExtra {
  redial?: <T extends Dialog.DialogData>(newConfig: Dialog.DialogSpec<T>) => DialogManager.DialogInit<T>;
  closeWindow: () => void;
}

export interface DialogSpec {
  header: AlloySpec;
  body: AlloyParts.ConfiguredPart;
  footer: Optional<AlloyParts.ConfiguredPart>;
  extraClasses: string[];
  extraStyles: Record<string, string>;
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[];
}

const getHeader = (title: string, backstage: UiFactoryBackstage) => renderModalHeader({
  title: backstage.shared.providers.translate(title),
  draggable: backstage.dialog.isDraggableModal()
}, backstage.shared.providers);

const getBusySpec = (message: string, bs: Record<string, Behaviour.ConfiguredBehaviour<any, any, any>>, providers: UiFactoryBackstageProviders) => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__busy-spinner' ],
    attributes: {
      'aria-label': providers.translate(message)
    },
    styles: {
      left: '0px',
      right: '0px',
      bottom: '0px',
      top: '0px',
      position: 'absolute'
    }
  },
  behaviours: bs,
  components: [{
    dom: DomFactory.fromHtml('<div class="tox-spinner"><div></div><div></div><div></div></div>')
  }]
});

const getEventExtras = (lazyDialog: () => AlloyComponent, providers: UiFactoryBackstageProviders, extra: WindowExtra) => ({
  onClose: () => extra.closeWindow(),
  onBlock: (blockEvent: FormBlockEvent) => {
    ModalDialog.setBusy(lazyDialog(), (_comp, bs) => getBusySpec(blockEvent.message, bs, providers));
  },
  onUnblock: () => {
    ModalDialog.setIdle(lazyDialog());
  }
});

const renderModalDialog = (spec: DialogSpec, initialData, dialogEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[], backstage: UiFactoryBackstage) => {
  const updateState = (_comp, incoming) => Optional.some(incoming);

  return GuiFactory.build(Dialogs.renderDialog({
    ...spec,
    lazySink: backstage.shared.getSink,
    extraBehaviours: [
      Reflecting.config({
        channel: dialogChannel,
        updateState,
        initialData
      }),
      RepresentingConfigs.memory({ }),
      ...spec.extraBehaviours
    ],
    onEscape: (comp) => {
      AlloyTriggers.emit(comp, formCancelEvent);
    },
    dialogEvents,
    eventOrder: {
      [SystemEvents.receive()]: [ Reflecting.name(), Receiving.name() ],
      [SystemEvents.attachedToDom()]: [ 'scroll-lock', Reflecting.name(), 'messages', 'dialog-events', 'alloy.base.behaviour' ],
      [SystemEvents.detachedFromDom()]: [ 'alloy.base.behaviour', 'dialog-events', 'messages', Reflecting.name(), 'scroll-lock' ]
    }
  }));
};

const mapMenuButtons = (buttons: Dialog.DialogFooterButton[]): (Dialog.DialogFooterButton | StoragedMenuButton)[] => {
  const mapItems = (button: Dialog.DialogFooterMenuButton): StoragedMenuButton => {
    const items = Arr.map(button.items, (item: Dialog.DialogFooterToggleMenuItem): StoragedMenuItem => {
      const cell = Cell<boolean>(false);
      return {
        ...item,
        storage: cell
      };
    });
    return {
      ...button,
      items
    };
  };

  return Arr.map(buttons, (button: Dialog.DialogFooterMenuButton) => {
    if (button.type === 'menu') {
      return mapItems(button);
    }
    return button;
  });
};

const extractCellsToObject = (buttons: (StoragedMenuButton | Dialog.DialogFooterMenuButton | Dialog.DialogFooterNormalButton)[]) =>
  Arr.foldl(buttons, (acc, button) => {
    if (button.type === 'menu') {
      const menuButton = button as StoragedMenuButton;
      return Arr.foldl(menuButton.items, (innerAcc, item) => {
        innerAcc[item.name] = item.storage;
        return innerAcc;
      }, acc);
    }
    return acc;
  }, {});

export {
  getBusySpec,
  getHeader,
  getEventExtras,
  renderModalDialog,
  mapMenuButtons,
  extractCellsToObject
};
