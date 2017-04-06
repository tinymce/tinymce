define(
  'tinymce.themes.mobile.ui.SerialisedDialog',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Focusing',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Button',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Option',
    'ephox.katamari.api.Singleton',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.model.SwipingModel',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (
    EventRoot, AdhocBehaviour, Focusing, Representing, SystemEvents, Button, Container, Form, EventHandler, FieldSchema, Objects, ValueSchema, Arr, Cell, Option,
    Singleton, Css, SelectorFilter, SelectorFind, Width, SwipingModel, Styles
  ) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('fields'),
      FieldSchema.strict('onExecute'),
      FieldSchema.strict('getInitialValue'),
      FieldSchema.state('state', function () {
        return {
          dialogSwipeState: Singleton.value(),
          currentScreen: Cell(0)
        };
      })
    ]);

    var sketch = function (rawSpec) {
      var navigateEvent = 'navigateEvent';

      var spec = ValueSchema.asRawOrDie('SerialisedDialog', schema, rawSpec);

      var prevButton = function (enabled) {
        return Button.sketch({
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-previous') ].concat(
              enabled ? [ ] : [ Styles.resolve('toolbar-navigation-disabled') ]
            )
          },
          action: function (button) {
            SystemEvents.trigger(button, navigateEvent, { direction: -1 });
          }
        });
      };

      var nextButton = function (enabled) {
        return Button.sketch({
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-next') ].concat(
              enabled ? [ ] : [ Styles.resolve('toolbar-navigation-disabled') ]
            )
          },
          action: function (button) {
            SystemEvents.trigger(button, navigateEvent, { direction: +1 });
          }
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
          dialog.getSystem().getByDom(input).each(Focusing.focus);
        });
      };

      var resetState = function () {
        spec.state.currentScreen.set(0);
        spec.state.dialogSwipeState.clear();
      };

      return Form.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('serialised-dialog') ]
        },
        components: [
          Container.sketch({
            dom: {
              tag: 'div',
              classes: [ Styles.resolve('serialised-dialog-chain') ],
              styles: {
                left: '0px',
                position: 'absolute'
              }
            },
            components: Arr.map(spec.fields, function (field, i) {
              return Container.sketch({
                dom: {
                  tag: 'div',
                  classes: [ Styles.resolve('serialised-dialog-screen') ]
                },
                components: Arr.flatten([
                  [ prevButton(i > 0) ],
                  [ Form.parts(field.name) ],
                  [ nextButton(i < spec.fields.length - 1) ]
                ])
              });
            })
          })
        ],

        parts: (function () {
          var r = { };
          Arr.each(spec.fields, function (f) {
            r[f.name] = f.spec;
          });
          return r;
        })(),

        formBehaviours: {
          keying: {
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
          },
          'adhoc-serialised-dialog-events': { enabled: true }
        },

        customBehaviours: [
          AdhocBehaviour.events(
            'adhoc-serialised-dialog-events',
            Objects.wrapAll([
              {
                key: SystemEvents.attachedToDom(),
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    if (EventRoot.isSource(dialog, simulatedEvent)) {
                      // Reset state to first screen.
                      resetState();
                      spec.getInitialValue(dialog).each(function (v) {
                        Representing.setValue(dialog, v);
                      });
                    }
                  }
                })
              },
              {
                key: SystemEvents.execute(),
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    spec.onExecute(dialog, simulatedEvent);
                  }
                })
              },
              {
                key: 'touchstart',
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    spec.state.dialogSwipeState.set(
                      SwipingModel.init(simulatedEvent.event().raw().touches[0].clientX)
                    );
                  }
                })
              },
              {
                key: 'touchmove',
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    spec.state.dialogSwipeState.on(function (state) {
                      simulatedEvent.event().prevent();
                      spec.state.dialogSwipeState.set(
                        SwipingModel.move(state, simulatedEvent.event().raw().touches[0].clientX)
                      );
                    });
                  }
                })
              },
              {
                key: 'touchend',
                value: EventHandler.nu({
                  run: function (dialog/*, simulatedEvent */) {
                    spec.state.dialogSwipeState.on(function (state) {
                      // Confusing
                      var direction = -1 * SwipingModel.complete(state);
                      navigate(dialog, direction);
                    });
                  }
                })
              },

              {
                key: 'transitionend',
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    if (simulatedEvent.event().raw().propertyName === 'left') {
                      focusInput(dialog);
                    }
                  }
                })
              },

              {
                key: navigateEvent,
                value: EventHandler.nu({
                  run: function (dialog, simulatedEvent) {
                    var direction = simulatedEvent.event().direction();
                    navigate(dialog, direction);
                  }
                })
              }
            ])
          )
        ]
      });
    };

    return {
      sketch: sketch
    };
  }
);