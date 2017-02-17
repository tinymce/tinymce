define(
  'ephox.alloy.behaviour.representing.RepresentSchema',

  [
    'ephox.alloy.behaviour.representing.RepresentApis',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Fun',
    'ephox.perhaps.Result',
    'ephox.scullion.Cell'
  ],

  function (RepresentApis, FieldSchema, ValueSchema, Fun, Result, Cell) {
    return [
      FieldSchema.defaulted('onSet', Fun.identity),
      

      FieldSchema.defaultedOf('store', { mode: 'memory' }, ValueSchema.choose('mode', {
        memory: [
          // TODO: Find a better way of storing this.
          FieldSchema.state('state', function () { return Cell(null); }),
          FieldSchema.defaulted('initialValue', { }),
          
          FieldSchema.state('manager', function () {

            var setValue = function (component, repInfo, data) {
              repInfo.store().state().set(data);
            };

            var getValue = function (component, repInfo) {
              return repInfo.store().state().get();
            };

            var onLoad = function (component, repInfo) {
              var current = repInfo.store().state().get();
              var data = current !== null ? current : repInfo.store().initialValue();
              RepresentApis.extractValue(component, repInfo, data).each(function (newData) {
                repInfo.store().state().set(newData);
                repInfo.onSet()(component, newData);
              });
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
              setValue: function (component, repInfo, data) {
                repInfo.store().setValue()(component, data);
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
      ]),
      FieldSchema.option('extractValue')
    ];
  }
);