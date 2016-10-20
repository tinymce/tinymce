define(
  'ephox.alloy.spec.DummySpec',

  [
    'ephox.alloy.construct.EventHandler',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.highway.Merger',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result'
  ],

  function (EventHandler, FieldPresence, FieldSchema, Objects, ValueSchema, Arr, Obj, Merger, Fun, Result) {
    var helpers = {
      'input': function (detail) {
        var extra = detail.dependents.input !== undefined ? detail.dependents.input : { };
        return Merger.deepMerge(extra, {
          uiType: 'input'
        });
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
      ),
      FieldSchema.field(
        'dependents',
        'dependents',
        FieldPresence.defaulted({ }),
        ValueSchema.valueOf(function (dependents) {
          var keys = Obj.keys(dependents);
          console.log('keys', keys, dependents);
          var unknown = Arr.filter(keys, function (key) {
            return !Objects.hasKey(helpers, key);
          });

          return unknown.length > 0 ? Result.error('Specified dependent components that DummySpec does not know: ' + unknown.join(', ') + '\nKnown: ' + Obj.keys(helpers)) : Result.value(dependents);
        }))
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