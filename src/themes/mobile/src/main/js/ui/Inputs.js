define(
  'tinymce.themes.mobile.ui.Inputs',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.DataField',
    'ephox.alloy.api.ui.Input',
    'ephox.katamari.api.Option',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (
    AddEventsBehaviour, Behaviour, Composing, Representing, Toggling, Memento, AlloyEvents,
    AlloyTriggers, NativeEvents, Button, Container, DataField, Input, Option, Styles, UiDomFactory
  ) {
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

    return {
      field: field,
      hidden: hidden
    };
  }
);