// DUPE with SilverDialog. Cleaning up.
import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyTriggers, Behaviour, Blocking, Composing, Focusing, GuiFactory, Keying, Memento, NativeEvents,
  Receiving, Reflecting, Replacing, SystemEvents
} from '@ephox/alloy';
import { Dialog, DialogManager } from '@ephox/bridge';
import { Fun, Id, Optional, Optionals } from '@ephox/katamari';
import { Attribute, Classes, Height, SugarElement, SugarNode } from '@ephox/sugar';

import * as Backstage from '../../backstage/Backstage';
import * as RepresentingConfigs from '../alien/RepresentingConfigs';
import * as FormEvents from '../general/FormEvents';
import * as NavigableObject from '../general/NavigableObject';
import * as DialogChannels from './DialogChannels';
import * as SilverDialogBody from './SilverDialogBody';
import * as SilverDialogCommon from './SilverDialogCommon';
import * as SilverDialogEvents from './SilverDialogEvents';
import * as SilverDialogFooter from './SilverDialogFooter';
import * as SilverDialogHeader from './SilverDialogHeader';
import * as SilverDialogInstanceApi from './SilverDialogInstanceApi';

interface RenderedDialog<T extends Dialog.DialogData> {
  readonly dialog: AlloyComponent;
  readonly instanceApi: Dialog.DialogInstanceApi<T>;
}

const getInlineDialogSizeClass = (size: Dialog.DialogSize): Optional<string> => {
  switch (size) {
    case 'medium':
      return Optional.some('tox-dialog--width-md');
    default:
      return Optional.none();
  }
};

const renderInlineDialog = <T extends Dialog.DialogData>(dialogInit: DialogManager.DialogInit<T>, extra: SilverDialogCommon.WindowExtra<T>, backstage: Backstage.UiFactoryBackstage, ariaAttrs: boolean = false): RenderedDialog<T> => {
  const dialogId = Id.generate('dialog');
  const dialogLabelId = Id.generate('dialog-label');
  const dialogContentId = Id.generate('dialog-content');
  const internalDialog = dialogInit.internalDialog;
  const dialogSize = getInlineDialogSizeClass(internalDialog.size);

  const updateState = (_comp: AlloyComponent, incoming: DialogManager.DialogInit<T>) => Optional.some(incoming);

  const memHeader = Memento.record(
    SilverDialogHeader.renderInlineHeader({
      title: internalDialog.title,
      draggable: true
    }, dialogId, dialogLabelId, backstage.shared.providers)
  );

  const memBody = Memento.record(
    SilverDialogBody.renderInlineBody({
      body: internalDialog.body,
      initialData: internalDialog.initialData,
    }, dialogId, dialogContentId, backstage, ariaAttrs)
  );

  const storagedMenuButtons = SilverDialogCommon.mapMenuButtons(internalDialog.buttons);

  const objOfCells = SilverDialogCommon.extractCellsToObject(storagedMenuButtons);

  const optMemFooter = Optionals.someIf(
    storagedMenuButtons.length !== 0,
    Memento.record(
      SilverDialogFooter.renderInlineFooter({
        buttons: storagedMenuButtons
      }, dialogId, backstage)
    ));

  const dialogEvents = SilverDialogEvents.initDialog(
    () => instanceApi,
    {
      onBlock: (event) => {
        Blocking.block(dialog, (_comp, bs) => {
          const headerHeight = memHeader.getOpt(dialog).map((dialog) => Height.get(dialog.element));
          return SilverDialogCommon.getBusySpec(event.message, bs, backstage.shared.providers, headerHeight);
        });
      },
      onUnblock: () => {
        Blocking.unblock(dialog);
      },
      onClose: () => extra.closeWindow()
    },
    backstage.shared.getSink
  );

  const inlineClass = 'tox-dialog-inline';

  // TODO: Disable while validating?
  const dialog = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog', inlineClass, ...dialogSize.toArray() ],
      attributes: {
        role: 'dialog',
        ['aria-labelledby']: dialogLabelId
      }
    },
    eventOrder: {
      [SystemEvents.receive()]: [ Reflecting.name(), Receiving.name() ],
      [SystemEvents.execute()]: [ 'execute-on-form' ],
      [SystemEvents.attachedToDom()]: [ 'reflecting', 'execute-on-form' ]
    },

    // Dupe with SilverDialog.
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'cyclic',
        onEscape: (c) => {
          AlloyTriggers.emit(c, FormEvents.formCloseEvent);
          return Optional.some(true);
        },
        useTabstopAt: (elem) => !NavigableObject.isPseudoStop(elem) && (
          SugarNode.name(elem) !== 'button' || Attribute.get(elem, 'disabled') !== 'disabled'
        ),
        firstTabstop: 1
      }),
      Reflecting.config({
        channel: `${DialogChannels.dialogChannel}-${dialogId}`,
        updateState,
        initialData: dialogInit
      }),
      Focusing.config({ }),
      AddEventsBehaviour.config(
        'execute-on-form',
        dialogEvents.concat([
          // Note: `runOnSource` here will only listen to the event at the outer component level.
          // Using just `run` instead will cause an infinite loop as `focusIn` would fire a `focusin` which would then get responded to and so forth.
          AlloyEvents.runOnSource(NativeEvents.focusin(), (comp, _se) => {
            Keying.focusIn(comp);
          }),
          AlloyEvents.run<SystemEvents.AlloyFocusShiftedEvent>(SystemEvents.focusShifted(), (comp, se) => {
            comp.getSystem().broadcastOn([ DialogChannels.dialogFocusShiftedChannel ], {
              newFocus: se.event.newFocus
            });
          })
        ])
      ),
      Blocking.config({ getRoot: () => Optional.some(dialog) }),
      Replacing.config({}),
      RepresentingConfigs.memory({})
    ]),

    components: [
      memHeader.asSpec(),
      memBody.asSpec(),
      ...optMemFooter.map((memFooter) => memFooter.asSpec()).toArray()
    ]
  });

  const toggleFullscreen = (): void => {
    const fullscreenClass = 'tox-dialog--fullscreen';
    const sugarBody = SugarElement.fromDom(dialog.element.dom);
    if (!Classes.hasAll(sugarBody, [ fullscreenClass ])) {
      Classes.remove(sugarBody, [ inlineClass ]);
      Classes.add(sugarBody, [ fullscreenClass ]);
    } else {
      Classes.remove(sugarBody, [ fullscreenClass ]);
      Classes.add(sugarBody, [ inlineClass ]);
    }
  };

  // TODO: Clean up the dupe between this (InlineDialog) and SilverDialog
  const instanceApi = SilverDialogInstanceApi.getDialogApi<T>({
    getId: Fun.constant(dialogId),
    getRoot: Fun.constant(dialog),
    getFooter: () => optMemFooter.map((memFooter) => memFooter.get(dialog)),
    getBody: () => memBody.get(dialog),
    getFormWrapper: () => {
      const body = memBody.get(dialog);
      return Composing.getCurrent(body).getOr(body);
    },
    toggleFullscreen
  }, extra.redial, objOfCells);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderInlineDialog
};
