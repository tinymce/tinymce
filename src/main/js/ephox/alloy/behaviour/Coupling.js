define(
  'ephox.alloy.behaviour.Coupling',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.Objects',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Obj',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.perhaps.Result',
    'global!Error'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, Objects, ValueSchema, Obj, Json, Fun, Result, Error) {
    var coupleState = function () {
      var coupled = { };

      var getOrCreate = function (component, coupledInfo, name) {
        var available = Obj.keys(coupledInfo.others());
        if (! available) throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + Json.stringify(available, null, 2));
        else return Objects.readOptFrom(coupled, name).getOrThunk(function () {
          var builder = Objects.readOptFrom(coupledInfo.others(), name).getOrDie('No information found for coupled component: ' + name);
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
    var schema = FieldSchema.field(
      'coupling',
      'coupling',
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.field('others', 'others', FieldPresence.strict(), ValueSchema.setOf(Result.value, ValueSchema.anyValue())),
        FieldSchema.state('state', coupleState)
      ])
    );

    var getCoupled = function (component, coupledInfo, name) {
      return coupledInfo.state().getOrCreate(component, coupledInfo, name);
    };

    var exhibit = function (info, base) {
      return DomModification.nu({});
    };

    var apis = function (info) {
      return {
        getCoupled: Behaviour.tryActionOpt('coupling', info, 'getCoupled', getCoupled)
      };
    };

    return Behaviour.contract({
      name: Fun.constant('coupling'),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);