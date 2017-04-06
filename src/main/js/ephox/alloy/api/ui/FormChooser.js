define(
  'ephox.alloy.api.ui.FormChooser',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.api.events.SystemEvents',
    'ephox.alloy.api.ui.UiSketcher',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.parts.PartType',
    'ephox.alloy.ui.schema.FormChooserSchema',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Merger',
    'ephox.sugar.api.properties.Attr',
    'ephox.sugar.api.search.SelectorFilter'
  ],

  function (EventRoot, Highlighting, Representing, SystemEvents, UiSketcher, EventHandler, PartType, FormChooserSchema, Objects, Arr, Fun, Merger, Attr, SelectorFilter) {
    var schema = FormChooserSchema.schema();
    var partTypes = FormChooserSchema.parts();

    var sketch = function (spec) {
      return UiSketcher.composite(FormChooserSchema.name(), schema, partTypes, make, spec);
    };

    var make = function (detail, components, spec, externals) {
      var findByValue = function (chooser, value) {
        var choices = SelectorFilter.descendants(chooser.element(), '.' + detail.markers().choiceClass());
        var choiceComps = Arr.map(choices, function (c) {
          return chooser.getSystem().getByDom(c).getOrDie();
        });

        return Arr.find(choiceComps, function (c) {
          return Representing.getValue(c) === value;
        });
      };

      return {
        uid: detail.uid(),
        dom: detail.dom(),
        components: components,

        behaviours: Merger.deepMerge(
          {
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
          detail.chooserBehaviours()
        ),

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
      sketch: sketch,
      parts: Fun.constant(parts)
    };
  }
);