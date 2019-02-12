/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

// DUPE with SilverDialog. Cleaning up.
import {
  AddEventsBehaviour,
  AlloyComponent,
  AlloyTriggers,
  Behaviour,
  Composing,
  DomFactory,
  GuiFactory,
  ModalDialog,
  Reflecting,
  SystemEvents,
  Focusing,
  AlloyEvents,
  NativeEvents,
  Keying,
} from '@ephox/alloy';
import { DialogManager, Types } from '@ephox/bridge';
import { Option } from '@ephox/katamari';
import { Attr, Body, Class, Node } from '@ephox/sugar';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import { FormBlockEvent, formCancelEvent } from '../general/FormEvents';
import NavigableObject from '../general/NavigableObject';
import { dialogChannel } from './DialogChannels';
import { renderModalBody } from './SilverDialogBody';
import { SilverDialogEvents } from './SilverDialogEvents';
import { renderModalFooter } from './SilverDialogFooter';
import { renderModalHeader } from './SilverDialogHeader';
import { getDialogApi } from './SilverDialogInstanceApi';

interface WindowExtra<T> {
  redial: (newConfig: Types.Dialog.DialogApi<T>) => DialogManager.DialogInit<T>;
  closeWindow: () => void;
}

const renderDialog = <T>(dialogInit: DialogManager.DialogInit<T>, extra: WindowExtra<T>, backstage: UiFactoryBackstage) => {
  const updateState = (_comp, incoming: DialogManager.DialogInit<T>) => {
    return Option.some(incoming);
  };

  const header = renderModalHeader({
    title: backstage.shared.providers.translate(dialogInit.internalDialog.title),
    draggable: true
  }, backstage.shared.providers);

  const body = renderModalBody({
    body: dialogInit.internalDialog.body
  }, backstage);

  const footer = renderModalFooter({
    buttons: dialogInit.internalDialog.buttons
  }, backstage.shared.providers);

  const dialogEvents = SilverDialogEvents.init(
    () => instanceApi,
    {
      onClose: () => extra.closeWindow(),
      onBlock: (blockEvent: FormBlockEvent) => {
        ModalDialog.setBusy(dialog, (d, bs) => {
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
        ModalDialog.setIdle(dialog);
      }
    }
  );

  const dialogSize = dialogInit.internalDialog.size !== 'normal'
    ? dialogInit.internalDialog.size === 'large'
      ? 'tox-dialog--width-lg'
      : 'tox-dialog--width-md'
    : [];

  const dialog = GuiFactory.build(
    ModalDialog.sketch({
      lazySink: backstage.shared.getSink,
      // TODO: Disable while validating
      onEscape(c) {
        AlloyTriggers.emit(c, formCancelEvent);
        return Option.some(true);
      },

      useTabstopAt: (elem) => {
        return !NavigableObject.isPseudoStop(elem) && (
          Node.name(elem) !== 'button' || Attr.get(elem, 'disabled') !== 'disabled'
        );
      },

      modalBehaviours: Behaviour.derive([
        Reflecting.config({
          channel: dialogChannel,
          updateState,
          initialData: dialogInit
        }),
        Focusing.config({}),
        AddEventsBehaviour.config('execute-on-form', dialogEvents.concat([
          AlloyEvents.runOnSource(NativeEvents.focusin(), (comp, se) => {
            Keying.focusIn(comp);
          })
        ])),
        AddEventsBehaviour.config('scroll-lock', [
          AlloyEvents.runOnAttached(() => {
            Class.add(Body.body(), 'tox-dialog__disable-scroll');
          }),
          AlloyEvents.runOnDetached(() => {
            Class.remove(Body.body(), 'tox-dialog__disable-scroll');
          }),
        ]),
        RepresentingConfigs.memory({ })
      ]),

      eventOrder: {
        [SystemEvents.execute()]: [ 'execute-on-form' ],
        [SystemEvents.attachedToDom()]: [ 'scroll-lock', 'reflecting', 'execute-on-form', 'alloy.base.behaviour' ],
        [SystemEvents.detachedFromDom()]: [ 'alloy.base.behaviour', 'execute-on-form', 'reflecting', 'scroll-lock' ],
      },

      dom: {
        tag: 'div',
        classes: [ 'tox-dialog' ].concat(dialogSize),
        styles: {
          position: 'relative'
        }
      },
      components: [
        header,
        body,
        footer
      ],
      dragBlockClass: 'tox-dialog-wrap',
      parts: {
        blocker: {
          dom: DomFactory.fromHtml('<div class="tox-dialog-wrap"></div>'),
          components: [
            {
              dom: {
                tag: 'div',
                classes: [ 'tox-dialog-wrap__backdrop' ]
              }
            }
          ]
        }
      }
    })
  );

  const modalAccess = (() => {
    const getForm = (): AlloyComponent => {
      const outerForm = ModalDialog.getBody(dialog);
      return Composing.getCurrent(outerForm).getOr(outerForm);
    };

    return {
      getRoot: () => dialog,
      getBody: () => ModalDialog.getBody(dialog),
      getFooter: () => ModalDialog.getFooter(dialog),
      getFormWrapper: getForm
    };
  })();

  // TODO: Get the validator from the dialog state.
  const instanceApi = getDialogApi<T>(modalAccess, extra.redial);

  return {
    dialog,
    instanceApi
  };
};

export {
  renderDialog
};
