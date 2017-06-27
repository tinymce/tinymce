define(
  'tinymce.themes.mobile.ui.SerialisedDialog',

  [
    'ephox.alloy.api.behaviour.AddEventsBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Disabling',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.Memento',
    'ephox.alloy.api.events.AlloyEvents',
    'ephox.alloy.api.events.AlloyTriggers',
    'ephox.alloy.api.events.NativeEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Form',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.channels.Receivers',
    'tinymce.themes.mobile.model.SwipingModel',
    'tinymce.themes.mobile.style.Styles',
    'tinymce.themes.mobile.util.UiDomFactory'
  ],

  function (
    AddEventsBehaviour, Behaviour, Disabling, Highlighting, Keying, Receiving, Representing, Memento, AlloyEvents, AlloyTriggers, NativeEvents, Button, Container,
    Form, FieldSchema, ValueSchema, Arr, Cell, Option, Singleton, Css, SelectorFilter, SelectorFind, Width, Receivers, SwipingModel, Styles, UiDomFactory
  ) {
    var sketch = function (rawSpec) {
      var navigateEvent = 'navigateEvent';

      var wrapperAdhocEvents = 'serializer-wrapper-events';
      var formAdhocEvents = 'form-events';

      var schema = ValueSchema.objOf([
        FieldSchema.strict('fields'),
        // Used for when datafields are present.
        FieldSchema.defaulted('maxFieldIndex', rawSpec.fields.length - 1),
        FieldSchema.strict('onExecute'),
        FieldSchema.strict('getInitialValue'),
        FieldSchema.state('state', function () {
          return {
            dialogSwipeState: Singleton.value(),
            currentScreen: Cell(0)
          };
        })
      ]);

      var spec = ValueSchema.asRawOrDie('SerialisedDialog', schema, rawSpec);

      var navigationButton = function (direction, directionName, enabled) {
        return Button.sketch({
          dom: UiDomFactory.dom('<span class="${prefix}-icon-' + directionName + ' ${prefix}-icon"></span>'),
          action: function (button) {
            AlloyTriggers.emitWith(button, navigateEvent, { direction: direction });
          },
          buttonBehaviours: Behaviour.derive([
            Disabling.config({
              disableClass: Styles.resolve('toolbar-navigation-disabled'),
              disabled: !enabled
            })
          ])
        });
      };

      var reposition = function (dialog, message) {
        SelectorFind.descendant(dialog.element(), '.' + Styles.resolve('serialised-dialog-chain')).each(function (parent) {
          Css.set(parent, 'left', (-spec.state.currentScreen.get() * message.width) + 'px');
        });
      };

      var navigate = function (dialog, direction) {
        var screens = SelectorFilter.descendants(dialog.element(), '.' + Styles.resolve('serialised-dialog-screen'));
        SelectorFind.descendant(dialog.element(), '.' + Styles.resolve('serialised-dialog-chain')).each(function (parent) {
          if ((spec.state.currentScreen.get() + direction) >= 0 && (spec.state.currentScreen.get() + direction) < screens.length) {
            Css.getRaw(parent, 'left').each(function (left) {
              var currentLeft = parseInt(left, 10);
              var w = Width.get(screens[0]);
              Css.set(parent, 'left', (currentLeft - (direction * w)) + 'px');
            });
            spec.state.currentScreen.set(spec.state.currentScreen.get() + direction);
          }
        });
      };

      // Unfortunately we need to inspect the DOM to find the input that is currently on screen
      var focusInput = function (dialog) {
        var inputs = SelectorFilter.descendants(dialog.element(), 'input');
        var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
        optInput.each(function (input) {
          dialog.getSystem().getByDom(input).each(function (inputComp) {
            AlloyTriggers.dispatchFocus(dialog, inputComp.element());
          });
        });
        var dotitems = memDots.get(dialog);
        Highlighting.highlightAt(dotitems, spec.state.currentScreen.get());
      };

      var resetState = function () {
        spec.state.currentScreen.set(0);
        spec.state.dialogSwipeState.clear();
      };

      var memForm = Memento.record(
        Form.sketch(function (parts) {
          return {
            dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog"></div>'),
            components: [
              Container.sketch({
                dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog-chain" style="left: 0px; position: absolute;"></div>'),
                components: Arr.map(spec.fields, function (field, i) {
                  return i <= spec.maxFieldIndex ? Container.sketch({
                    dom: UiDomFactory.dom('<div class="${prefix}-serialised-dialog-screen"></div>'),
                    components: Arr.flatten([
                      [ navigationButton(-1, 'previous', (i > 0)) ],
                      [ parts.field(field.name, field.spec) ],
                      [ navigationButton(+1, 'next', (i < spec.maxFieldIndex)) ]
                    ])
                  }) : parts.field(field.name, field.spec);
                })
              })
            ],

            formBehaviours: Behaviour.derive([
              Receivers.orientation(function (dialog, message) {
                reposition(dialog, message);
              }),
              Keying.config({
                mode: 'special',
                focusIn: function (dialog/*, specialInfo */) {
                  focusInput(dialog);
                },
                onTab: function (dialog/*, specialInfo */) {
                  navigate(dialog, +1);
                  return Option.some(true);
                },
                onShiftTab: function (dialog/*, specialInfo */) {
                  navigate(dialog, -1);
                  return Option.some(true);
                }
              }),

              AddEventsBehaviour.config(formAdhocEvents, [
                AlloyEvents.runOnAttached(function (dialog, simulatedEvent) {
                  // Reset state to first screen.
                  resetState();
                  var dotitems = memDots.get(dialog);
                  Highlighting.highlightFirst(dotitems);
                  spec.getInitialValue(dialog).each(function (v) {
                    Representing.setValue(dialog, v);
                  });
                }),

                AlloyEvents.runOnExecute(spec.onExecute),

                AlloyEvents.run(NativeEvents.transitionend(), function (dialog, simulatedEvent) {
                  if (simulatedEvent.event().raw().propertyName === 'left') {
                    focusInput(dialog);
                  }
                }),

                AlloyEvents.run(navigateEvent, function (dialog, simulatedEvent) {
                  var direction = simulatedEvent.event().direction();
                  navigate(dialog, direction);
                })
              ])
            ])
          };
        })
      );

      var memDots = Memento.record({
        dom: UiDomFactory.dom('<div class="${prefix}-dot-container"></div>'),
        behaviours: Behaviour.derive([
          Highlighting.config({
            highlightClass: Styles.resolve('dot-active'),
            itemClass: Styles.resolve('dot-item')
          })
        ]),
        components: Arr.bind(spec.fields, function (_f, i) {
          return i <= spec.maxFieldIndex ? [
            UiDomFactory.spec('<div class="${prefix}-dot-item ${prefix}-icon-full-dot ${prefix}-icon"></div>')
          ] : [];
        })
      });

      return {
        dom: UiDomFactory.dom('<div class="${prefix}-serializer-wrapper"></div>'),
        components: [
          memForm.asSpec(),
          memDots.asSpec()
        ],

        behaviours: Behaviour.derive([
          Keying.config({
            mode: 'special',
            focusIn: function (wrapper) {
              var form = memForm.get(wrapper);
              Keying.focusIn(form);
            }
          }),

          AddEventsBehaviour.config(wrapperAdhocEvents, [
            AlloyEvents.run(NativeEvents.touchstart(), function (wrapper, simulatedEvent) {
              spec.state.dialogSwipeState.set(
                SwipingModel.init(simulatedEvent.event().raw().touches[0].clientX)
              );
            }),
            AlloyEvents.run(NativeEvents.touchmove(), function (wrapper, simulatedEvent) {
              spec.state.dialogSwipeState.on(function (state) {
                simulatedEvent.event().prevent();
                spec.state.dialogSwipeState.set(
                  SwipingModel.move(state, simulatedEvent.event().raw().touches[0].clientX)
                );
              });
            }),
            AlloyEvents.run(NativeEvents.touchend(), function (wrapper/*, simulatedEvent */) {
              spec.state.dialogSwipeState.on(function (state) {
                var dialog = memForm.get(wrapper);
                // Confusing
                var direction = -1 * SwipingModel.complete(state);
                navigate(dialog, direction);
              });
            })
          ])
        ])
      };
    };

    return {
      sketch: sketch
    };
  }
);