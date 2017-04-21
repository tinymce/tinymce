define(
  'tinymce.themes.mobile.ui.Inputs',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Composing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.DataField',
    'ephox.alloy.api.ui.Input',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.katamari.api.Option',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (
    EventRoot, AdhocBehaviour, Behaviour, Composing, Representing, Toggling, Memento, SystemEvents, Button, Container, DataField, Input, EventHandler, Objects,
    Fun, Merger, Option, Styles
  ) {
    var field = function (name, placeholder) {
      // TODO: simplify the adhoc thing (inputEvents ?)
      var inputSpec = Memento.record(Input.sketch({
        placeholder: placeholder,
        onSetValue: function (input, data) {
          input.getSystem().triggerEvent('input', input.element(), {
            target: Fun.constant(input.element())
          });
        },
        inputBehaviours: {
          composing: { find: Option.some }
        }
      }));

      var buttonSpec = Memento.record(
        Button.sketch({
          dom: {
            tag: 'button',
            classes: [ Styles.resolve('input-container-x') ],
            innerHtml: 'x'
          },
          action: function (button) {
            var input = inputSpec.get(button);
            Representing.setValue(input, '');
          }
        })
      );

      return {
        name: name,
        spec: Container.sketch({
          dom: {
            classes: [ Styles.resolve('input-container') ]
          },
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
            {
              key: 'input-clearing',
              value: { enabled: true }
            }
          ]),
          customBehaviours: [
            AdhocBehaviour.events('input-clearing', 
              Merger.deepMerge(
                {
                  input: EventHandler.nu({
                    run: function (iContainer) {
                      var input = inputSpec.get(iContainer);
                      var val = Representing.getValue(input);
                      if (val.length > 0) Toggling.off(iContainer);
                      else Toggling.on(iContainer);
                    }
                  })
                }
              )
            )
          ]
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