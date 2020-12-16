/**
 * Copyright (c) Tiny Technologies, Inc. All rights reserved.
 * Licensed under the LGPL or a commercial license.
 * For LGPL see License.txt in the project root for license information.
 * For commercial licenses see https://www.tiny.cloud/
 */

import {
  AddEventsBehaviour, AlloyEvents, AlloyTriggers, Behaviour, Button, Composing, Container, DataField, Input, Keying, Memento, NativeEvents,
  Representing, Tabstopping, Toggling
} from '@ephox/alloy';
import { Optional } from '@ephox/katamari';

import I18n from 'tinymce/core/api/util/I18n';

import * as Styles from '../style/Styles';
import * as UiDomFactory from '../util/UiDomFactory';

const clearInputBehaviour = 'input-clearing';

const field = (name, placeholder) => {
  const inputSpec = Memento.record(Input.sketch({
    inputAttributes: { placeholder: I18n.translate(placeholder) },
    onSetValue: (input, _data) => {
      // If the value changes, inform the container so that it can update whether the "x" is visible
      AlloyTriggers.emit(input, NativeEvents.input());
    },
    inputBehaviours: Behaviour.derive([
      Composing.config({
        find: Optional.some
      }),
      Tabstopping.config({ }),
      Keying.config({
        mode: 'execution'
      })
    ]),
    selectOnFocus: false
  }));

  const buttonSpec = Memento.record(
    Button.sketch({
      dom: UiDomFactory.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: (button) => {
        const input = inputSpec.get(button);
        Representing.setValue(input, '');
      }
    })
  );

  return {
    name,
    spec: Container.sketch({
      dom: UiDomFactory.dom('<div class="${prefix}-input-container"></div>'),
      components: [
        inputSpec.asSpec(),
        buttonSpec.asSpec()
      ],
      containerBehaviours: Behaviour.derive([
        Toggling.config({
          toggleClass: Styles.resolve('input-container-empty')
        }),
        Composing.config({
          find: (comp) => {
            return Optional.some(inputSpec.get(comp));
          }
        }),
        AddEventsBehaviour.config(clearInputBehaviour, [
          // INVESTIGATE: Because this only happens on input,
          // it won't reset unless it has an initial value
          AlloyEvents.run(NativeEvents.input(), (iContainer) => {
            const input = inputSpec.get(iContainer);
            const val = Representing.getValue(input);
            const f = val.length > 0 ? Toggling.off : Toggling.on;
            f(iContainer);
          })
        ])
      ])
    })
  };
};

const hidden = (name) => ({
  name,
  spec: DataField.sketch({
    dom: {
      tag: 'span',
      styles: {
        display: 'none'
      }
    },
    getInitialValue: () => {
      return Optional.none();
    }
  })
});

export {
  field,
  hidden
};
