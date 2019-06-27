/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour,
  AlloyEvents,
  AlloySpec,
  Behaviour,
  Button,
  Container,
  DomFactory,
  ModalDialog,
  Tabstopping,
  AlloyComponent,
} from '@ephox/alloy';
import { Merger, Option, Result } from '@ephox/katamari';

import { UiFactoryBackstageProviders } from '../../backstage/Backstage';
import { FormCancelEvent, formCancelEvent, FormSubmitEvent, formSubmitEvent } from '../general/FormEvents';

const hiddenHeader: AlloySpec = {
  dom: {
    tag: 'div',
    styles: { display: 'none' },
    classes: [ 'tox-dialog__header' ]
  }
};

const defaultHeader: AlloySpec = {
  dom: {
    tag: 'div',
    classes: [ 'tox-dialog__header' ]
  }
};

const pClose = (onClose, providersBackstage: UiFactoryBackstageProviders) => ModalDialog.parts().close(
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
        classes: ['tox-dialog__body-content']
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
  components: buttons,
});

const pFooterGroup = (startButtons: AlloySpec[], endButtons: AlloySpec[]) => {
  return [
    Container.sketch({
      dom: {
        tag: 'div',
        classes: [ `tox-dialog__footer-start` ]
      },
      components: startButtons
    }),
    Container.sketch({
      dom: {
        tag: 'div',
        classes: [ `tox-dialog__footer-end` ]
      },
      components: endButtons
    })
  ];
};

export interface DialogFoo {
  lazySink: () => Result<AlloyComponent, any>;
  headerOverride: Option<AlloySpec>;
  partSpecs: {
    title: AlloySpec,
    close: AlloySpec,
    body: AlloySpec,
    footer: AlloySpec
  };
  onCancel: () => void;
  onSubmit: () => void;
  extraClasses: string[];
}

const renderDialog = (spec: DialogFoo) => {
  return ModalDialog.sketch(
    {
      lazySink: spec.lazySink,
      onEscape: () => {
        spec.onCancel();
        // TODO: Make a strong type for Handled KeyEvent
        return Option.some(true);
      },
      dom: {
        tag: 'div',
        classes: [ 'tox-dialog' ].concat(spec.extraClasses)
      },
      components: [
        Merger.deepMerge(spec.headerOverride.getOr(defaultHeader), {
          components: [
            spec.partSpecs.title,
            spec.partSpecs.close
          ]
        }),
        spec.partSpecs.body,
        spec.partSpecs.footer
      ],
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
      },
      modalBehaviours: Behaviour.derive([
        // Dupe warning.
        AddEventsBehaviour.config('basic-dialog-events', [
          AlloyEvents.run<FormCancelEvent>(formCancelEvent, (comp, se) => {
            spec.onCancel();
          }),
          AlloyEvents.run<FormSubmitEvent>(formSubmitEvent, (comp, se) => {
            spec.onSubmit();
          }),
        ])
      ])
    }
  );
};

export { defaultHeader, hiddenHeader, pClose, pUntitled, pBodyMessage, pFooter, pFooterGroup, renderDialog };
