define(
  'ephox.alloy.api.ui.FormChooser',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Behaviour',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.UiBuilder',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.data.Fields',
    'ephox.alloy.dom.DomModification',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.common.ButtonBase',
    'ephox.alloy.ui.schema.FormChooserSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.compass.Arr',
    'ephox.peanut.Fun',
    'ephox.perhaps.Option',
    'ephox.sugar.api.Attr',
    'ephox.sugar.api.SelectorFilter'
  ],

  function (EventRoot, Behaviour, Highlighting, Representing, SystemEvents, UiBuilder, EventHandler, Fields, DomModification, PartType, ButtonBase, FormChooserSchema, FieldSchema, Objects, Arr, Fun, Option, Attr, SelectorFilter) {
    var schema = FormChooserSchema.schema();
    var partTypes = FormChooserSchema.parts();

    var build = function (spec) {
      return UiBuilder.composite(FormChooserSchema.name(), schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      var findByValue = function (chooser, value) {
        var choices = SelectorFilter.descendants(chooser.element(), '.' + detail.markers().choiceClass());
        var choiceComps = Arr.map(choices, function (c) {
          return chooser.getSystem().getByDom(c).getOrDie();
        });

        var chosen = Arr.find(choiceComps, function (c) {
          return Representing.getValue(c) === value;
        });

        return Option.from(chosen);
      };

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: {
          keying: {
            mode: 'flow',
            selector: '.' + detail.markers().choiceClass(),
            executeOnMove: true,
            getInitial: function (chooser) {
              return Highlighting.getHighlighted(chooser).map(function (choice) {
                return choice.element();
              });
            },
            execute: function (chooser, simulatedEvent, focused) {
              return chooser.getSystem().getByDom(focused).map(function (choice) {
                Highlighting.highlight(chooser, choice);
                return true;
              });
            }
          },

          highlighting: {
            itemClass: detail.markers().choiceClass(),
            highlightClass: detail.markers().selectedClass(),
            onHighlight: function (chooser, choice) {
              Attr.set(choice.element(), 'aria-checked', 'true');
            },
            onDehighlight: function (chooser, choice) {
              Attr.set(choice.element(), 'aria-checked', 'false');
            }
          },

          representing: {
            store: {
              mode: 'manual',
              setValue: function (chooser, value) {
                findByValue(chooser, value).each(function (choiceWithValue) {
                  Highlighting.highlight(chooser, choiceWithValue);
                });
              },
              getValue: function (chooser) {
                return Highlighting.getHighlighted(chooser).map(Representing.getValue);
              }
            }
          }
        },

        events: Objects.wrapAll([
          {
            key: SystemEvents.execute(),
            value: EventHandler.nu({
              run: function (chooser, simulatedEvent) {
                // TODO :Check this will always be present (button property)
                chooser.getSystem().getByDom(simulatedEvent.event().target()).each(function (choice) {
                  Highlighting.highlight(chooser, choice);
                });
              }
            })
          },

          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (chooser, simulatedEvent) {
                if (EventRoot.isSource(chooser, simulatedEvent)) {
                  Highlighting.getFirst(chooser).each(function (choice) {
                    Highlighting.highlight(chooser, choice);
                  });
                }
              }
            })
          }

        ])
      };
    };

    var parts = PartType.generate(FormChooserSchema.name(), partTypes);

    return {
      build: build,
      parts: Fun.constant(parts)
    };
  }
);