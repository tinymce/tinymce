define(
  'ephox.alloy.spec.InputSpec',

  [
    'ephox.alloy.alien.EventRoot',
    'ephox.alloy.api.SystemEvents',
    'ephox.alloy.api.behaviour.Representing',
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.perhaps.Option',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Value'
  ],

  function (EventRoot, SystemEvents, Representing, EventHandler, FieldSchema, Objects, ValueSchema, Arr, Merger, Option, Cell, Value) {
    // This is not fleshed out yet.
    var schema = ValueSchema.objOf([
      FieldSchema.defaulted('classes', [ ]),
      FieldSchema.option('value'),
      FieldSchema.option('placeholder'),
      FieldSchema.defaulted('type', 'input'),
      FieldSchema.defaulted('tag', 'input'),
      FieldSchema.defaulted('tabstop', true),

      FieldSchema.state('holdingValue', function () { return Cell(Option.none()); })
    ]);

    var make = function (spec) {
      var detail = ValueSchema.asStructOrDie('input.spec', schema, spec);

      var toProp = function (opt, name) {
        return opt.map(function (v) {
          // FIX: ItemData.value
          return [ { key: name, value: v.text } ];
        }).getOr([ ]);
      };

      return Merger.deepMerge({
        uiType: 'custom',
        // Simplify this
        dom: Objects.wrapAll(
          Arr.flatten([
            toProp(detail.value(), 'value'),
            [
              { key: 'tag', value: detail.tag() },              
              {
                key: 'attributes',
                value: Objects.wrapAll(
                  Arr.flatten([
                    toProp(detail.placeholder(), 'placeholder'),
                    [ { key: 'type', value: detail.type() }]
                  ])
                )
              }
            ]
          ])
        ),

        behaviours: {
          representing: {
            initialValue: detail.value().getOr({ value: '', text: '' }),

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

            onSet: function (input, value) {
              Value.set(input.element(), value.text);
            }
          },

          tabstopping: detail.tabstop(),
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
                  detail.value().each(function (value) {
                    Representing.setValue(simulated, value);
                  });
                }
              }
            }) 
          }

        ])
      }, spec);
    };

    return {
      make: make
    };
  }
);