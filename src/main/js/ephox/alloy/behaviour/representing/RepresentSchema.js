define(
  'ephox.alloy.behaviour.representing.RepresentSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell'
  ],

  function (FieldSchema, ValueSchema, Fun, Cell) {
    return [
      FieldSchema.defaulted('onSet', Fun.identity),
      

      FieldSchema.defaultedOf('store', { mode: 'memory' }, ValueSchema.choose('mode', {
        memory: [
          FieldSchema.state('state', function () { return Cell(); }),
          FieldSchema.defaulted('initialValue', { }),
          FieldSchema.state('manager', function () {

            var setValue = function (component, repInfo, value) {
              repInfo.store().state().set(value);
            };

            var getValue = function (component, repInfo) {
              return repInfo.store().state().get();
            };

            var onLoad = function (component, repInfo) {
              var value = repInfo.store().initialValue();
              setValue(component, repInfo, value);
              repInfo.onSet()(component, value);
            };

            return {
              setValue: setValue,
              getValue: getValue,
              onLoad: onLoad
            };
          })

        ],
        manual: [
          FieldSchema.strict('getValue'),
          FieldSchema.defaulted('setValue', Fun.noop),
          FieldSchema.state('manager', function () {
            return {
              setValue: function (component, repInfo, value) {
                repInfo.store().setValue()(component, value);
              },
              getValue: function (component, repInfo) {
                return repInfo.store().getValue()(component);  
              },
              onLoad: Fun.noop
            };
          })
        ]
      })),
      FieldSchema.optionObjOf('interactive', [
        FieldSchema.strict('event'),
        FieldSchema.strict('process')
      ])
    ];
  }
);