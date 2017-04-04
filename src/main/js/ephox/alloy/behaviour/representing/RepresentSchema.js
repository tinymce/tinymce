define(
  'ephox.alloy.behaviour.representing.RepresentSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Cell',
    'ephox.katamari.api.Fun'
  ],

  function (FieldSchema, Objects, ValueSchema, Cell, Fun) {
    return [
      FieldSchema.defaultedOf('store', { mode: 'memory' }, ValueSchema.choose('mode', {
        memory: [
          // TODO: Find a better way of storing this.
          FieldSchema.state('state', function () { return Cell(null); }),
          FieldSchema.option('initialValue'),
          
          FieldSchema.state('manager', function () {

            var setValue = function (component, repInfo, data) {
              repInfo.store().state().set(data);
            };

            var getValue = function (component, repInfo) {
              return repInfo.store().state().get();
            };

            var onLoad = function (component, repInfo) {
              var current = repInfo.store().state().get();
              repInfo.store().initialValue().each(function (initVal) {
                if (current === null) repInfo.store().state().set(initVal);
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
          FieldSchema.option('initialValue', { }),
          FieldSchema.state('manager', function () {
            var getValue = function (component, repInfo) {
              return repInfo.store().getValue()(component);
            };

            var setValue = function (component, repInfo, data) {
              repInfo.store().setValue()(component, data);
            };

            var onLoad = function (component, repInfo) {
              repInfo.store().initialValue().each(function (data) {
                repInfo.store().setValue()(component, data);
              });
            };

            return {
              setValue: setValue,
              getValue: getValue,
              onLoad: onLoad
            };
          })
        ],

        dataset: [
          FieldSchema.state('dataset', Fun.constant(Cell({ }))),
          FieldSchema.option('initialValue'),
          FieldSchema.strict('getFallbackEntry'),
          FieldSchema.strict('getDataKey'),
          FieldSchema.strict('setData'),
          FieldSchema.state('manager', function () {
            var setValue = function (component, repInfo, data) {
              repInfo.store().dataset().set({ });
              repInfo.store().setData()(component, data);
            };

            var getValue = function (component, repInfo) {
              var key = repInfo.store().getDataKey()(component);
              var dataset = repInfo.store().dataset().get();
              return Objects.readOptFrom(dataset, key).fold(function () {
                return repInfo.store().getFallbackEntry()(key);
              }, function (data) {
                return data;
              });
            };

            var onLoad = function (component, repInfo) {
              repInfo.store().initialValue().each(function (data) {
                setValue(component, repInfo, data);
              });
            };

            return {
              setValue: setValue,
              getValue: getValue,
              onLoad: onLoad
            };
          })
        ]
      }))
    ];
  }
);