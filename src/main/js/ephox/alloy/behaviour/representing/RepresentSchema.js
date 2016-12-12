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
          FieldSchema.option('isValidValue'),
          FieldSchema.state('manager', function () {

            var setValue = function (component, repInfo, data) {
              if (isValidValue(component, repInfo, data)) {
                repInfo.store().state().set(data);
              }
            };

            var isValidValue = function (component, repInfo, data) {
              return repInfo.store().isValidValue().fold(Fun.constant(true), function (f) {
                return f(component, data);
              });
            };

            var getValue = function (component, repInfo) {
              return repInfo.store().state().get();
            };

            var onLoad = function (component, repInfo) {
              var data = repInfo.store().initialValue();
              if (isValidValue(component, repInfo, data)) {
                setValue(component, repInfo, data);
                repInfo.onSet()(component, data);
              }
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