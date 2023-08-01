import {
  AddEventsBehaviour, AlloyComponent, AlloyEvents, AlloyParts, AlloySpec, Behaviour, Blocking, Button, Container, DomFactory, Focusing, Keying, ModalDialog,
  NativeEvents, SketchSpec, SystemEvents, Tabstopping
} from '@ephox/alloy';
import { Fun, Optional, Result } from '@ephox/katamari';
import { Class, SugarBody } from '@ephox/sugar';

import Env from 'tinymce/core/api/Env';

import * as Backstage from '../../backstage/Backstage';
import * as HtmlSanitizer from '../core/HtmlSanitizer';
import * as NavigableObject from '../general/NavigableObject';
import * as DialogChannels from '../window/DialogChannels';

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

const pClose = (onClose: () => void, providersBackstage: Backstage.UiFactoryBackstageProviders): AlloyParts.ConfiguredPart => ModalDialog.parts.close(
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

const pUntitled = (): AlloyParts.ConfiguredPart => ModalDialog.parts.title({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__title' ],
    innerHtml: '',
    styles: {
      display: 'none'
    }
  }
});

const pBodyMessage = (message: string, providersBackstage: Backstage.UiFactoryBackstageProviders): AlloyParts.ConfiguredPart => ModalDialog.parts.body({
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
          dom: DomFactory.fromHtml(`<p>${HtmlSanitizer.sanitizeHtmlString(providersBackstage.translate(message))}</p>`)
        }
      ]
    }
  ]
});

const pFooter = (buttons: AlloySpec[]): AlloyParts.ConfiguredPart => ModalDialog.parts.footer({
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__footer' ]
  },
  components: buttons
});

const pFooterGroup = (startButtons: AlloySpec[], endButtons: AlloySpec[]): SketchSpec[] => [
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
  footer: Optional<AlloyParts.ConfiguredPart>;
  onEscape: (comp: AlloyComponent) => void;
  extraClasses: string[];
  extraBehaviours: Behaviour.NamedConfiguredBehaviour<any, any>[];
  extraStyles: Record<string, string>;
  dialogEvents: AlloyEvents.AlloyEventKeyAndHandler<any>[];
  eventOrder: Record<string, string[]>;
  firstTabstop?: number;
}

const renderDialog = (spec: DialogSpec): SketchSpec => {
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
        return Optional.some(true);
      },
      useTabstopAt: (elem) => !NavigableObject.isPseudoStop(elem),
      firstTabstop: spec.firstTabstop,
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
            Blocking.isBlocked(comp) ? Fun.noop() : Keying.focusIn(comp);
          }),
          AlloyEvents.run<SystemEvents.AlloyFocusShiftedEvent>(SystemEvents.focusShifted(), (comp, se) => {
            comp.getSystem().broadcastOn([ DialogChannels.dialogFocusShiftedChannel ], {
              newFocus: se.event.newFocus
            });
          })
        ])),
        AddEventsBehaviour.config('scroll-lock', [
          AlloyEvents.runOnAttached(() => {
            Class.add(SugarBody.body(), scrollLockClass);
          }),
          AlloyEvents.runOnDetached(() => {
            Class.remove(SugarBody.body(), scrollLockClass);
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
