define(
  'ephox.alloy.spec.DummySpec',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (EventHandler, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Merger, Fun, Result) {
    var helpers = {
      'input': function (detail) {
        return {
          uiType: 'input'
        };
      }
    };

    var schema = ValueSchema.objOf([
      FieldSchema.field(
        'components',
        'components',
        FieldPresence.defaulted([ ]),
        ValueSchema.arrOf(
          ValueSchema.valueOf(function (comp) {
            if (comp.uiType !== 'dependent') return Result.value(Fun.constant(comp));
            else return Objects.hasKey(helpers, comp.name) ? Result.value(helpers[comp.name]) : Result.error('Dependent component: ' + comp.name + ' not known by DummySpec');
          })
        )
      )
    ]);




    var make = function (spec) {
      
      // Not sure about where these getOrDie statements are
      var detail = ValueSchema.asRawOrDie('dummy.spec', schema, spec);

      console.log('I have a chance to change it');

      var components = Arr.map(detail.components, function (comp) {
        return comp(detail);
      });



      console.log('components', components);



      return Merger.deepMerge(
        spec,
        {
          components: components
        }
      );
    };

    return {
      make: make
    };
  }
);