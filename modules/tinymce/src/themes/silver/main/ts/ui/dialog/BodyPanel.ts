/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import { Behaviour, Form as AlloyForm, Keying, Memento, SimpleSpec } from '@ephox/alloy';
import { Dialog } from '@ephox/bridge';
import { Arr, Fun } from '@ephox/katamari';

import { UiFactoryBackstage } from '../../backstage/Backstage';
import { ComposingConfigs } from '../alien/ComposingConfigs';
import { RepresentingConfigs } from '../alien/RepresentingConfigs';
import * as FormValues from '../general/FormValues';
import * as NavigableObject from '../general/NavigableObject';
import { interpretInForm } from '../general/UiFactory';

export type BodyPanelSpec = Omit<Dialog.Panel, 'type'>;

const renderBodyPanel = (spec: BodyPanelSpec, backstage: UiFactoryBackstage): SimpleSpec => {
  const memForm = Memento.record(
    AlloyForm.sketch((parts) => ({
      dom: {
        tag: 'div',
        classes: [ 'tox-form' ].concat(spec.classes)
      },
      // All of the items passed through the form need to be put through the interpreter
      // with their form part preserved.
      components: Arr.map(spec.items, (item) => interpretInForm(parts, item, backstage))
    }))
  );

  return {
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
          memForm.asSpec()
        ]
      }
    ],
    behaviours: Behaviour.derive([
      Keying.config({
        mode: 'acyclic',
        useTabstopAt: Fun.not(NavigableObject.isPseudoStop)
      }),
      ComposingConfigs.memento(memForm),
      RepresentingConfigs.memento(memForm, {
        postprocess: (formValue) => FormValues.toValidValues(formValue).fold(
          (err) => {
            // eslint-disable-next-line no-console
            console.error(err);
            return { };
          },
          Fun.identity
        )
      })
    ])
  };
};

export {
  renderBodyPanel
};
