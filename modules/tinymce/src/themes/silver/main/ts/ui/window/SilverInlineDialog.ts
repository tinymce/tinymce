/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// DUPE with SilverDialog. Cleaning up.
import {
  AddEventsBehaviour,
  AlloyTriggers,
  Behaviour,
  Composing,
  GuiFactory,
  Keying,
  Memento,
  Receiving,
  Reflecting,
  SimpleSpec,
  SystemEvents
} from '@ephox/alloy';
import { DialogManager, Types } from '@ephox/bridge';
import { Option, Id } from '@ephox/katamari';
import { Attr, Node } from '@ephox/sugar';

import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { formCloseEvent } from '../general/FormEvents';
import NavigableObject from '../general/NavigableObject';
import { dialogChannel } from './DialogChannels';
import { renderInlineBody } from './SilverDialogBody';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderInlineFooter } from './SilverDialogFooter';
import { renderInlineHeader } from './SilverDialogHeader';
import { getDialogApi } from './SilverDialogInstanceApi';
import { UiFactoryBackstage } from '../../backstage/Backstage';

interface WindowExtra<T> {
  redial: (newConfig: Types.Dialog.DialogApi<T>) => DialogManager.DialogInit<T>;
  closeWindow: () => void;
}

const renderInlineDialog = <T>(dialogInit: DialogManager.DialogInit<T>, extra: WindowExtra<T>, backstage: UiFactoryBackstage, ariaAttrs: boolean) => {
  const dialogLabelId = Id.generate('dialog-label');
  const dialogContentId = Id.generate('dialog-content');

  const updateState = (_comp, incoming: DialogManager.DialogInit<T>) => {
    return Option.some(incoming);
  };

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

  const memFooter = Memento.record(
    renderInlineFooter({
      buttons: dialogInit.internalDialog.buttons
    }, backstage.shared.providers)
  );

  const dialogEvents = SilverDialogEvents.initDialog(
    () => instanceApi,
    {
      // TODO: Implement block and unblock for inline dialogs
      onBlock: () => { },
      onUnblock: () => { },
      onClose: () => extra.closeWindow()
    }
  );

  // TODO: Disable while validating?
  const dialog = GuiFactory.build({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog' ],
      attributes: {
        role: 'dialog',
        ['aria-labelledby']: dialogLabelId,
        ['aria-describedby']: `${dialogContentId}`,
      }
    },
    eventOrder: {
      [SystemEvents.receive()]: [ Reflecting.name(), Receiving.name() ],
      [SystemEvents.execute()]: ['execute-on-form'],
      [SystemEvents.attachedToDom()]: ['reflecting', 'execute-on-form']
    },

    // Dupe with SilverDialog.
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'cyclic',
        onEscape: (c) => {
          AlloyTriggers.emit(c, formCloseEvent);
          return Option.some(true);
        },
        useTabstopAt: (elem) => {
          return !NavigableObject.isPseudoStop(elem) && (
            Node.name(elem) !== 'button' || Attr.get(elem, 'disabled') !== 'disabled'
          );
        }
      }),
      Reflecting.config({
        channel: dialogChannel,
        updateState,
        initialData: dialogInit
      }),
      AddEventsBehaviour.config(
        'execute-on-form',
        dialogEvents
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
  }, extra.redial);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderInlineDialog
};
