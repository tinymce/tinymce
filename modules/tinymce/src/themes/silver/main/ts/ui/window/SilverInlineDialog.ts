/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// DUPE with SilverDialog. Cleaning up.
import {
  AddEventsBehaviour, AlloyEvents, AlloyTriggers, Behaviour, Composing, Focusing, GuiFactory, Keying, Memento, NativeEvents, Receiving,
  Reflecting, SimpleSpec, SystemEvents
} from '@ephox/alloy';
import { DialogManager } from '@ephox/bridge';
import { Id, Option } from '@ephox/katamari';
import { Attr, Node } from '@ephox/sugar';
import { UiFactoryBackstage } from '../../backstage/Backstage';

import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { formCloseEvent } from '../general/FormEvents';
import * as NavigableObject from '../general/NavigableObject';
import { dialogChannel } from './DialogChannels';
import { renderInlineBody } from './SilverDialogBody';
import * as SilverDialogCommon from './SilverDialogCommon';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderInlineFooter } from './SilverDialogFooter';
import { renderInlineHeader } from './SilverDialogHeader';
import { getDialogApi } from './SilverDialogInstanceApi';

const renderInlineDialog = <T>(dialogInit: DialogManager.DialogInit<T>, extra: SilverDialogCommon.WindowExtra, backstage: UiFactoryBackstage, ariaAttrs: boolean) => {
  const dialogLabelId = Id.generate('dialog-label');
  const dialogContentId = Id.generate('dialog-content');

  const updateState = (_comp, incoming: DialogManager.DialogInit<T>) => Option.some(incoming);

  const memHeader = Memento.record(
    renderInlineHeader({
      title: dialogInit.internalDialog.title,
      draggable: true
    }, dialogLabelId, backstage.shared.providers) as SimpleSpec
  );

  const memBody = Memento.record(
    renderInlineBody({
      body: dialogInit.internalDialog.body
    }, dialogContentId, backstage, ariaAttrs) as SimpleSpec
  );

  const storagedMenuButtons = SilverDialogCommon.mapMenuButtons(dialogInit.internalDialog.buttons);

  const objOfCells = SilverDialogCommon.extractCellsToObject(storagedMenuButtons);

  const memFooter = Memento.record(
    renderInlineFooter({
      buttons: storagedMenuButtons
    }, backstage)
  );

  const dialogEvents = SilverDialogEvents.initDialog(
    () => instanceApi,
    {
      // TODO: Implement block and unblock for inline dialogs
      onBlock: () => { },
      onUnblock: () => { },
      onClose: () => extra.closeWindow()
    },
    backstage.shared.getSink
  );

  // TODO: Disable while validating?
  const dialog = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog', 'tox-dialog-inline' ],
      attributes: {
        role: 'dialog',
        ['aria-labelledby']: dialogLabelId,
        ['aria-describedby']: `${dialogContentId}`
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
          AlloyTriggers.emit(c, formCloseEvent);
          return Option.some(true);
        },
        useTabstopAt: (elem) => !NavigableObject.isPseudoStop(elem) && (
          Node.name(elem) !== 'button' || Attr.get(elem, 'disabled') !== 'disabled'
        )
      }),
      Reflecting.config({
        channel: dialogChannel,
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
          })
        ])
      ),
      RepresentingConfigs.memory({ })
    ]),

    components: [
      memHeader.asSpec(),
      memBody.asSpec(),
      memFooter.asSpec()
    ]
  });

  // TODO: Clean up the dupe between this (InlineDialog) and SilverDialog
  const instanceApi = getDialogApi<T>({
    getRoot: () => dialog,
    getFooter: () => memFooter.get(dialog),
    getBody: () => memBody.get(dialog),
    getFormWrapper: () => {
      const body = memBody.get(dialog);
      return Composing.getCurrent(body).getOr(body);
    }
  }, extra.redial, objOfCells);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderInlineDialog
};
