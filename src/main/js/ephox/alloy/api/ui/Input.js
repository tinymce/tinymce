define(
  'ephox.alloy.api.ui.Input',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.construct.EventHandler',
    'ephox.alloy.registry.Tagger',
    'ephox.alloy.spec.SpecSchema',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Value'
  ],

  function (EventRoot, SystemEvents, Representing, EventHandler, Tagger, SpecSchema, FieldSchema, Objects, Merger, Fun, Value) {
    var schema = [
      FieldSchema.option('data'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input')
    ];

    // Dupe with Tiered Menu
    var build = function (rawSpec) {
      var spec = Merger.deepMerge({ uid: Tagger.generate('') }, rawSpec);
      var detail = SpecSchema.asStructOrDie('Input', schema, spec, [ ]);
      return make(detail, spec);
    };

    var make = function (detail, spec) {
      return {
        uiType: 'custom',
        dom: {
          tag: detail.tag(),
          attributes: {
            type: detail.type()
          }
        },
        // No children.
        components: [ ],
        behaviours: {
          representing: {
            initialValue: detail.data().getOr({ value: '', text: '' }),

            interactive: {
              event: 'input',
              process: function (input) {
                var v = Value.get(input.element());
                return {
                  value: v.toLowerCase(),
                  text: v
                };
              }
            },

            onSet: function (input, data) {
              Value.set(input.element(), data.text);
            }
          },

          focusing: {
            onFocus: function (component) {
              var input = component.element();
              var value = Value.get(input);
              input.dom().setSelectionRange(0, value.length);
            }
          }
        },

        events: Objects.wrapAll([
          {
            key: SystemEvents.systemInit(),
            value: EventHandler.nu({
              run: function (simulated, simulatedEvent) {
                if (EventRoot.isSource(simulated, simulatedEvent)) {
                  detail.data().each(function (data) {
                    Representing.setValue(simulated, data);
                  });
                }
              }
            }) 
          }

        ])
      };
    };

    return {
      build: build,
      partial: Fun.identity
    };
  }
);