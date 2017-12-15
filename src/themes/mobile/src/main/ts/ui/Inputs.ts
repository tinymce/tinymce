import { AddEventsBehaviour } from '@ephox/alloy';
import { Behaviour } from '@ephox/alloy';
import { Composing } from '@ephox/alloy';
import { Representing } from '@ephox/alloy';
import { Toggling } from '@ephox/alloy';
import { Memento } from '@ephox/alloy';
import { AlloyEvents } from '@ephox/alloy';
import { AlloyTriggers } from '@ephox/alloy';
import { NativeEvents } from '@ephox/alloy';
import { Button } from '@ephox/alloy';
import { Container } from '@ephox/alloy';
import { DataField } from '@ephox/alloy';
import { Input } from '@ephox/alloy';
import { Option } from '@ephox/katamari';
import Styles from '../style/Styles';
import UiDomFactory from '../util/UiDomFactory';
import { Tabstopping } from '@ephox/alloy';
import { Keying } from '@ephox/alloy';

var clearInputBehaviour = 'input-clearing';

var field = function (name, placeholder) {
  var inputSpec = Memento.record(Input.sketch({
    placeholder: placeholder,
    onSetValue: function (input, data) {
      // If the value changes, inform the container so that it can update whether the "x" is visible
      AlloyTriggers.emit(input, NativeEvents.input());
    },
    inputBehaviours: Behaviour.derive([
      Composing.config({
        find: Option.some
      }),
      Tabstopping.config({ }),
      Keying.config({
        mode: 'execution'
      })
    ]),
    selectOnFocus: false
  }));

  var buttonSpec = Memento.record(
    Button.sketch({
      dom: UiDomFactory.dom('<button class="${prefix}-input-container-x ${prefix}-icon-cancel-circle ${prefix}-icon"></button>'),
      action: function (button) {
        var input = inputSpec.get(button);
        Representing.setValue(input, '');
      }
    })
  );

  return {
    name: name,
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
          find: function (comp) {
            return Option.some(inputSpec.get(comp));
          }
        }),
        AddEventsBehaviour.config(clearInputBehaviour, [
          // INVESTIGATE: Because this only happens on input,
          // it won't reset unless it has an initial value
          AlloyEvents.run(NativeEvents.input(), function (iContainer) {
            var input = inputSpec.get(iContainer);
            var val = Representing.getValue(input);
            var f = val.length > 0 ? Toggling.off : Toggling.on;
            f(iContainer);
          })
        ])
      ])
    })
  };
};

var hidden = function (name) {
  return {
    name: name,
    spec: DataField.sketch({
      dom: {
        tag: 'span',
        styles: {
          display: 'none'
        }
      },
      getInitialValue: function () {
        return Option.none();
      }
    })
  };
};

export default <any> {
  field: field,
  hidden: hidden
};