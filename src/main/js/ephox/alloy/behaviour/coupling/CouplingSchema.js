define(
  'ephox.alloy.behaviour.coupling.CouplingSchema',

  [
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.katamari.api.Obj',
    'ephox.sand.api.JSON',
    'ephox.katamari.api.Result',
    'global!Error'
  ],

  function (FieldSchema, Objects, ValueSchema, Obj, Json, Result, Error) {
    var coupleState = function () {
      var coupled = { };

      var getOrCreate = function (component, coupledInfo, name) {
        var available = Obj.keys(coupledInfo.others());
        if (! available) throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + Json.stringify(available, null, 2));
        else return Objects.readOptFrom(coupled, name).getOrThunk(function () {
          var builder = Objects.readOptFrom(coupledInfo.others(), name).getOrDie(
            new Error('No information found for coupled component: ' + name)
          );
          var spec = builder()(component);
          var built = component.getSystem().build(spec);
          coupled[name] = built;
          return built;
        });
      };

      return {
        getOrCreate: getOrCreate
      };
    };

    return [
      FieldSchema.strictOf('others', ValueSchema.setOf(Result.value, ValueSchema.anyValue())),
      FieldSchema.state('state', coupleState)
    ];
  }
);