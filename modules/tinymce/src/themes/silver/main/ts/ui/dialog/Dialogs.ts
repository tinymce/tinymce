/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */
import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, Behaviour, Button, Container, DomFactory, Focusing, Keying,
  ModalDialog, NativeEvents, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { Option, Result } from '@ephox/katamari';
import { Body, Class } from '@ephox/sugar';
import Env from 'tinymce/core/api/Env';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import * as NavigableObject from '../general/NavigableObject';

const isTouch = Env.deviceType.isTouch();

const hiddenHeader = (title: AlloyParts.ConfiguredPart, close: AlloyParts.ConfiguredPart): AlloySpec => ({
  dom: {
    tag: 'div',
    styles: { display: 'none' },
    classes: [ 'tox-dialog__header' ]
  },
  components: [
    title,
    close
  ]
});

const defaultHeader = (title: AlloyParts.ConfiguredPart, close: AlloyParts.ConfiguredPart): AlloySpec => ({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__header' ]
  },
  components: [
    title,
    close
  ]
});

const pClose = (onClose: () => void, providersBackstage: UiFactoryBackstageProviders) => ModalDialog.parts().close(
  // Need to find a way to make it clear in the docs whether parts can be sketches
  Button.sketch({
    dom: {
      tag: 'button',
      classes: [ 'tox-button', 'tox-button--icon', 'tox-button--naked' ],
      attributes: {
        'type': 'button',
        'aria-label': providersBackstage.translate('Close')
      }
    },
    action: onClose,
    buttonBehaviours: Behaviour.derive([
      Tabstopping.config({ })
    ])
  })
);

const pUntitled = () => ModalDialog.parts().title({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__title' ],
    innerHtml: '',
    styles: {
      display: 'none'
    }
  }
});

const pBodyMessage = (message: string, providersBackstage: UiFactoryBackstageProviders) => ModalDialog.parts().body({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__body' ]
  },
  components: [
    {
      dom: {
        tag: 'div',
        classes: [ 'tox-dialog__body-content' ]
      },
      components: [
        {
          dom: DomFactory.fromHtml(`<p>${providersBackstage.translate(message)}</p>`)
        }
      ]
    }
  ]
});

const pFooter = (buttons: AlloySpec[]) => ModalDialog.parts().footer({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__footer' ]
  },
  components: buttons
});

const pFooterGroup = (startButtons: AlloySpec[], endButtons: AlloySpec[]) => [
  Container.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__footer-start' ]
    },
    components: startButtons
  }),
  Container.sketch({
    dom: {
      tag: 'div',
      classes: [ 'tox-dialog__footer-end' ]
    },
    components: endButtons
  })
];

export interface DialogSpec {
  lazySink: () => Result<AlloyComponent, any>;
  header: AlloySpec;
  body: AlloyParts.ConfiguredPart;
  footer: Option<AlloyParts.ConfiguredPart>;
  onEscape: (comp: AlloyComponent) => void;
  extraClasses: string[];
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[];
  extraStyles: Record<string, string>;
  dialogEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[];
  eventOrder: Record<string, string[]>;
}

const renderDialog = (spec: DialogSpec) => {
  const dialogClass = 'tox-dialog';
  const blockerClass = dialogClass + '-wrap';
  const blockerBackdropClass = blockerClass + '__backdrop';
  const scrollLockClass = dialogClass + '__disable-scroll';

  return ModalDialog.sketch(
    {
      lazySink: spec.lazySink,
      onEscape: (comp) => {
        spec.onEscape(comp);
        // TODO: Make a strong type for Handled KeyEvent
        return Option.some(true);
      },
      useTabstopAt: (elem) => !NavigableObject.isPseudoStop(elem),
      dom: {
        tag: 'div',
        classes: [ dialogClass ].concat(spec.extraClasses),
        styles: {
          position: 'relative',
          ...spec.extraStyles
        }
      },
      components: [
        spec.header,
        spec.body,
        ...spec.footer.toArray()
      ],
      parts: {
        blocker: {
          dom: DomFactory.fromHtml(`<div class="${blockerClass}"></div>`),
          components: [
            {
              dom: {
                tag: 'div',
                classes: (isTouch ? [ blockerBackdropClass, blockerBackdropClass + '--opaque' ] : [ blockerBackdropClass ])
              }
            }
          ]
        }
      },
      dragBlockClass: blockerClass,

      modalBehaviours: Behaviour.derive([
        Focusing.config({}),
        AddEventsBehaviour.config('dialog-events', spec.dialogEvents.concat([
          // Note: `runOnSource` here will only listen to the event at the outer component level.
          // Using just `run` instead will cause an infinite loop as `focusIn` would fire a `focusin` which would then get responded to and so forth.
          AlloyEvents.runOnSource(NativeEvents.focusin(), (comp, _se) => {
            Keying.focusIn(comp);
          })
        ])),
        AddEventsBehaviour.config('scroll-lock', [
          AlloyEvents.runOnAttached(() => {
            Class.add(Body.body(), scrollLockClass);
          }),
          AlloyEvents.runOnDetached(() => {
            Class.remove(Body.body(), scrollLockClass);
          })
        ]),
        ...spec.extraBehaviours
      ]),

      eventOrder: {
        [SystemEvents.execute()]: [ 'dialog-events' ],
        [SystemEvents.attachedToDom()]: [ 'scroll-lock', 'dialog-events', 'alloy.base.behaviour' ],
        [SystemEvents.detachedFromDom()]: [ 'alloy.base.behaviour', 'dialog-events', 'scroll-lock' ],
        ...spec.eventOrder
      }
    }
  );
};

export { defaultHeader, hiddenHeader, pClose, pUntitled, pBodyMessage, pFooter, pFooterGroup, renderDialog };
