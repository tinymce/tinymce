define(
  'tinymce.themes.mobile.ui.SerialisedDialog',

  [
    'ephox.alloy.api.behaviour.Toggling',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.Container',
    'ephox.alloy.api.ui.Form',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Singleton',
    'ephox.katamari.api.Unicode',
    'ephox.sugar.api.properties.Css',
    'ephox.sugar.api.search.SelectorFilter',
    'ephox.sugar.api.search.SelectorFind',
    'ephox.sugar.api.view.Width',
    'tinymce.themes.mobile.model.SwipingModel',
    'tinymce.themes.mobile.style.Styles'
  ],

  function (
    Toggling, SystemEvents, Container, Form, EventHandler, FieldSchema, Objects, ValueSchema, Arr, Cell, Singleton, Unicode, Css, SelectorFilter, SelectorFind,
    Width, SwipingModel, Styles
  ) {
    var schema = ValueSchema.objOf([
      FieldSchema.strict('fields'),
      FieldSchema.strict('onExecute'),
      FieldSchema.state('state', function () {
        return {
          dialogSwipeState: Singleton.value(),
          currentScreen: Cell(0)
        }
      })
    ]);

    var sketch = function (rawSpec) {
      var spec = ValueSchema.asRawOrDie('SerialisedDialog', schema, rawSpec);

      var prevButton = function (enabled) {
        return Container.sketch({
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-previous') ].concat(
              enabled ? [ ] : [ Styles.resolve('toolbar-navigation-disabled') ]
            )
          }
        });
      };

      var nextButton = function (enabled) {
        return Container.sketch({
          dom: {
            tag: 'span',
            classes: [ Styles.resolve('toolbar-next') ].concat(
              enabled ? [ ] : [ Styles.resolve('toolbar-navigation-disabled') ]
            )
          }
        });
      };

      return Form.sketch({
        dom: {
          tag: 'div',
          classes: [ Styles.resolve('serialised-dialog') ]
        },
        components: [
          {
            dom: {
              tag: 'span',
              innerHtml: Unicode.zeroWidth()
            }
          },
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
                ]),

                behaviours: {
                  toggling: {
                    toggleClass: Styles.resolve('serialised-dialog-hint'),
                    aria: {
                      mode: 'none'
                    }
                  },
                  streaming: {
                    stream: {
                      mode: 'throttle',
                      delay: 1000
                    },
                    onStream: function (screen) {
                      // A reflow is required to restart the animation.
                      Toggling.off(screen);
                      Css.reflow(screen.element());
                      Toggling.on(screen);
                    }
                  }
                },

                // Transition end not quite working.
                events: {
                  // TODO: Add to alloy
                  animationend: EventHandler.nu({
                    run: function (input, simulatedEvent) {
                      Toggling.off(input);
                    }
                  })
                } 
              })        
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

        events: Objects.wrapAll([
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
              run: function (dialog, simulatedEvent) {
                spec.state.dialogSwipeState.on(function (state) {
                  // Confusing
                  var direction = -1 * SwipingModel.complete(state);
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
                });
              }
            })
          }
        ])
      });
    };

    return {
      sketch: sketch
    };
  }
);