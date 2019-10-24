/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import { AlloyEvents, AlloyParts, AlloySpec, AlloyTriggers, Behaviour, DomFactory, GuiFactory, ModalDialog, Reflecting, SystemEvents, } from '@ephox/alloy';
import { DialogManager, Types } from '@ephox/bridge';
import { Arr, Cell, Option } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { StoragedMenuButton, StoragedMenuItem } from '../button/MenuButton';
import * as Dialogs from '../dialog/Dialogs';
import { FormBlockEvent, formCancelEvent } from '../general/FormEvents';
import { dialogChannel } from './DialogChannels';
import { renderModalHeader } from './SilverDialogHeader';

export interface WindowExtra {
  redial?: <T extends Types.Dialog.DialogData>(newConfig: Types.Dialog.DialogApi<T>) => DialogManager.DialogInit<T>;
  closeWindow: () => void;
}

export interface DialogSpec {
  header: AlloySpec;
  body: AlloyParts.ConfiguredPart;
  footer: Option<AlloyParts.ConfiguredPart>;
  extraClasses: string[];
  extraStyles: Record<string, string>;
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[];
}

const getHeader = (title: string, backstage: UiFactoryBackstage) => {
  return renderModalHeader({
    title: backstage.shared.providers.translate(title),
    draggable: backstage.dialog.isDraggableModal()
  }, backstage.shared.providers);
};

const getEventExtras = (lazyDialog, extra: WindowExtra) => {
  return {
    onClose: () => extra.closeWindow(),
    onBlock: (blockEvent: FormBlockEvent) => {
      ModalDialog.setBusy(lazyDialog(), (d, bs) => {
        return {
          dom: {
            tag: 'div',
            classes: [ 'tox-dialog__busy-spinner' ],
            attributes: {
              'aria-label': blockEvent.message()
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
          components: [
            {
              dom: DomFactory.fromHtml(`<div class="tox-spinner"><div></div><div></div><div></div></div>`)
            }
          ]
        };
      });
    },
    onUnblock: () => {
      ModalDialog.setIdle(lazyDialog());
    }
  };
};

const renderModalDialog = (spec: DialogSpec, initialData, dialogEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[], backstage: UiFactoryBackstage) => {
  const updateState = (_comp, incoming) => {
    return Option.some(incoming);
  };

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
      [SystemEvents.receive()]: [ 'reflecting', 'receiving' ],
      [SystemEvents.attachedToDom()]: [ 'scroll-lock', 'reflecting', 'messages', 'dialog-events', 'alloy.base.behaviour' ],
      [SystemEvents.detachedFromDom()]: [ 'alloy.base.behaviour', 'dialog-events', 'messages', 'reflecting', 'scroll-lock' ],
    }
  }));
};

const mapMenuButtons = (buttons: Types.Dialog.DialogButton[]): (Types.Dialog.DialogButton | StoragedMenuButton)[] => {
  const mapItems = (button: Types.Dialog.DialogMenuButton): StoragedMenuButton => {
    const items = Arr.map(button.items, (item: Types.Dialog.DialogToggleMenuItem): StoragedMenuItem => {
      const cell = Cell<Boolean>(false);
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

  return Arr.map(buttons, (button: Types.Dialog.DialogMenuButton) => {
    if (button.type === 'menu') {
      return mapItems(button);
    }
    return button;
  });
};

const extractCellsToObject = (buttons: (StoragedMenuButton | Types.Dialog.DialogMenuButton | Types.Dialog.DialogNormalButton)[]) => {
  return Arr.foldl(buttons, (acc, button) => {
    if (button.type === 'menu') {
      const menuButton = button as StoragedMenuButton;
      return Arr.foldl(menuButton.items, (innerAcc, item) => {
        innerAcc[item.name] = item.storage;
        return innerAcc;
      }, acc);
    }
    return acc;
  }, {});
};

export {
  getHeader,
  getEventExtras,
  renderModalDialog,
  mapMenuButtons,
  extractCellsToObject
};
