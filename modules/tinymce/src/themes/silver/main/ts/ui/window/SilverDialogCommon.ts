import {
  AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, AlloyTriggers, Behaviour, DomFactory, GuiFactory, ModalDialog, Receiving, Reflecting,
  SystemEvents
} from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Arr, Cell, Obj, Optional } from '@ephox/katamari';
import { Class, Classes, Height, SelectorFind, SugarElement } from '@ephox/sugar';

import { UiFactoryBackstage, UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import { StoredMenuButton, StoredMenuItem } from '../button/MenuButton';
import * as Dialogs from '../dialog/Dialogs';
import { FormBlockEvent, formCancelEvent } from '../general/FormEvents';
import { ExtraListeners } from './SilverDialogEvents';
import { renderModalHeader } from './SilverDialogHeader';

export interface SharedWindowExtra {
  readonly closeWindow: () => void;
}

export interface WindowExtra<T extends Dialog.DialogData> extends SharedWindowExtra {
  readonly redial: (newConfig: Dialog.DialogSpec<T>) => DialogManager.DialogInit<T>;
}

export interface DialogSpec {
  readonly id: string;
  readonly header: AlloySpec;
  readonly body: AlloyParts.ConfiguredPart;
  readonly footer: Optional<AlloyParts.ConfiguredPart>;
  readonly extraClasses: string[];
  readonly extraStyles: Record<string, string>;
  readonly extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[];
}

const getHeader = (title: string, dialogId: string, backstage: UiFactoryBackstage): AlloySpec => renderModalHeader({
  title: backstage.shared.providers.translate(title),
  draggable: backstage.dialog.isDraggableModal()
}, dialogId, backstage.shared.providers);

const getBusySpec = (message: string, bs: Behaviour.AlloyBehaviourRecord, providers: UiFactoryBackstageProviders, headerHeight: Optional<number>): AlloySpec => ({
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
      top: `${headerHeight.getOr(0)}px`,
      position: 'absolute'
    }
  },
  behaviours: bs,
  components: [{
    dom: DomFactory.fromHtml('<div class="tox-spinner"><div></div><div></div><div></div></div>')
  }]
});

const getEventExtras = (lazyDialog: () => AlloyComponent, providers: UiFactoryBackstageProviders, extra: SharedWindowExtra): ExtraListeners => ({
  onClose: () => extra.closeWindow(),
  onBlock: (blockEvent: FormBlockEvent) => {
    const headerHeight = SelectorFind.descendant<HTMLElement>(lazyDialog().element, '.tox-dialog__header').map((header) => Height.get(header));
    ModalDialog.setBusy(lazyDialog(), (_comp, bs) => getBusySpec(blockEvent.message, bs, providers, headerHeight));
  },
  onUnblock: () => {
    ModalDialog.setIdle(lazyDialog());
  }
});

const fullscreenClass = 'tox-dialog--fullscreen';
const largeDialogClass = 'tox-dialog--width-lg';
const mediumDialogClass = 'tox-dialog--width-md';

const getDialogSizeClass = (size: Dialog.DialogSize): Optional<string> => {
  switch (size) {
    case 'large':
      return Optional.some(largeDialogClass);
    case 'medium':
      return Optional.some(mediumDialogClass);
    default:
      return Optional.none();
  }
};

const updateDialogSizeClass = (size: Dialog.DialogSize, component: AlloyComponent): void => {
  const dialogBody = SugarElement.fromDom(component.element.dom);
  if (!Class.has(dialogBody, fullscreenClass)) {
    Classes.remove(dialogBody, [ largeDialogClass, mediumDialogClass ]);
    getDialogSizeClass(size).each((dialogSizeClass) => Class.add(dialogBody, dialogSizeClass));
  }
};

const toggleFullscreen = (comp: AlloyComponent, currentSize: Dialog.DialogSize): void => {
  const dialogBody = SugarElement.fromDom(comp.element.dom);
  const classes = Classes.get(dialogBody);
  const currentSizeClass = Arr.find(classes, (c) => c === largeDialogClass || c === mediumDialogClass).or(getDialogSizeClass(currentSize));
  Classes.toggle(dialogBody, [ fullscreenClass, ...currentSizeClass.toArray() ]);
};

const renderModalDialog = (spec: DialogSpec, dialogEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[], backstage: UiFactoryBackstage): AlloyComponent => GuiFactory.build(Dialogs.renderDialog({
  ...spec,
  firstTabstop: 1,
  lazySink: backstage.shared.getSink,
  extraBehaviours: [
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

const mapMenuButtons = (buttons: Dialog.DialogFooterButton[], menuItemStates: Record<string, Cell<boolean>> = {}): (Dialog.DialogFooterButton | StoredMenuButton)[] => {
  const mapItems = (button: Dialog.DialogFooterMenuButton): StoredMenuButton => {
    const items = Arr.map(button.items, (item: Dialog.DialogFooterToggleMenuItem): StoredMenuItem => {
      const cell = Obj.get(menuItemStates, item.name).getOr(Cell<boolean>(false));
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

  return Arr.map(buttons, (button) => {
    return button.type === 'menu' ? mapItems(button) : button;
  });
};

const extractCellsToObject = (buttons: (StoredMenuButton | Dialog.DialogFooterMenuButton | Dialog.DialogFooterNormalButton | Dialog.DialogFooterToggleButton)[]): Record<string, Cell<boolean>> =>
  Arr.foldl(buttons, (acc, button) => {
    if (button.type === 'menu') {
      const menuButton = button as StoredMenuButton;
      return Arr.foldl(menuButton.items, (innerAcc, item) => {
        innerAcc[item.name] = item.storage;
        return innerAcc;
      }, acc);
    }
    return acc;
  }, {} as Record<string, Cell<boolean>>);

export {
  getBusySpec,
  getHeader,
  getEventExtras,
  updateDialogSizeClass,
  getDialogSizeClass,
  toggleFullscreen,
  renderModalDialog,
  mapMenuButtons,
  extractCellsToObject
};
