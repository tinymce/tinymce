define(
  'tinymce.themes.mobile.ui.SerialisedDialog',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.AdhocBehaviour',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Keying',
    'ephox.alloy.api.behaviour.Receiving',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.component.Memento',
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
    'ephox.katamari.api.Throttler',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.model.SwipingModel',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (
    EventRoot, AdhocBehaviour, Behaviour, Highlighting, Keying, Receiving, Representing, Memento, SystemEvents, Button, Container, Form, EventHandler, FieldSchema,
    Objects, ValueSchema, Arr, Cell, Option, Singleton, Throttler, Css, SelectorFilter, SelectorFind, Width, SwipingModel, Styles
  ) {
    var sketch = function (rawSpec) {
      var navigateEvent = 'navigateEvent';

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

      var prevButton = function (enabled) {
        return Button.sketch({
          dom: {
            tag: 'span',
            classes: [Styles.resolve('icon-previous'), Styles.resolve('icon')].concat(
              enabled ? [] : [Styles.resolve('toolbar-navigation-disabled')]
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
            classes: [Styles.resolve('icon-next'), Styles.resolve('icon')].concat(
              enabled ? [] : [Styles.resolve('toolbar-navigation-disabled')]
            )
          },
          action: function (button) {
            SystemEvents.trigger(button, navigateEvent, { direction: +1 });
          }
        });
      };

      var reposition = function (dialog) {
        SelectorFind.descendant(dialog.element(), '.' + Styles.resolve('serialised-dialog-chain')).each(function (parent) {
          var w = window.screen.width;
          Css.set(parent, 'left', (-spec.state.currentScreen.get() * w) + 'px');
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
            var dotitems = dots.get(dialog);
            Highlighting.hightlightAt(dotitems, spec.state.currentScreen.get());
          }
        });
      };

      // Unfortunately we need to inspect the DOM to find the input that is currently on screen
      var focusInput = function (dialog) {
        var inputs = SelectorFilter.descendants(dialog.element(), 'input');
        var optInput = Option.from(inputs[spec.state.currentScreen.get()]);
        optInput.each(function (input) {
          dialog.getSystem().getByDom(input).each(function (inputComp) {
            inputComp.getSystem().triggerFocus(inputComp.element(), dialog.element());
          });
        });
      };

      var resetState = function () {
        spec.state.currentScreen.set(0);
        spec.state.dialogSwipeState.clear();
      };



      var f = Form.sketch({
        dom: {
          tag: 'div',
          classes: [Styles.resolve('serialised-dialog')]
        },
        components: [
          Container.sketch({
            dom: {
              tag: 'div',
              classes: [Styles.resolve('serialised-dialog-chain')],
              styles: {
                left: '0px',
                position: 'absolute'
              }
            },
            components: Arr.map(spec.fields, function (field, i) {
              return i <= spec.maxFieldIndex ? Container.sketch({
                dom: {
                  tag: 'div',
                  classes: [Styles.resolve('serialised-dialog-screen')]
                },
                components: Arr.flatten([
                  [prevButton(i > 0)],
                  [Form.parts(field.name)],
                  [nextButton(i < spec.maxFieldIndex)]
                ])
              }) : Form.parts(field.name);
            })
          })
        ],

        parts: (function () {
          var r = {};
          Arr.each(spec.fields, function (f) {
            r[f.name] = f.spec;
          });
          return r;
        })(),

        formBehaviours: Behaviour.derive([
          Receiving.config({
            channels: {
              'orientation.change': {
                onReceive: function (dialog, message) {
                  reposition(dialog);
                }
              }
            }
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
          AdhocBehaviour.config('adhoc-serialised-dialog-events')
        ]),

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
                      var dotitems = dots.get(dialog);
                      Highlighting.highlightFirst(dotitems);
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

      var dots = Memento.record({
        dom: {
          tag: 'div',
          classes: [Styles.resolve('dot-container')]
        },
        behaviours: Behaviour.derive([
          Highlighting.config({
            highlightClass: Styles.resolve('dot-active'),
            itemClass: Styles.resolve('dot-item')
          })
        ]),
        components: Arr.bind(spec.fields, function (_f, i) {
          return i <= spec.maxFieldIndex ? [
            {
              dom: {
                tag: 'div',
                innerHtml: '&#x2022;',
                classes: [Styles.resolve('dot-item')]
              }
            }] : [];
        })
      });

      return {
        dom: {
          tag: 'div',
          classes: [Styles.resolve('serializer-wrapper')]
        },
        components: [
          f,
          dots.asSpec()
        ]
      };
    };

    return {
      sketch: sketch
    };
  }
);