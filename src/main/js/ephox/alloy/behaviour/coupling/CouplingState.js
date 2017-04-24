define(
  'ephox.alloy.behaviour.coupling.CouplingState',

  [
    'ephox.alloy.behaviour.common.BehaviourState',
    'ephox.boulder.api.Objects',
    'ephox.katamari.api.Fun',
    'ephox.katamari.api.Obj',
    'global!Error'
  ],

  function (BehaviourState, Objects, Fun, Obj, Error) {
    var init = function (spec) {
      var coupled = { };

      var getOrCreate = function (component, coupleConfig, name) {
        var available = Obj.keys(coupleConfig.others());
        if (! available) throw new Error('Cannot find coupled component: ' + name + '. Known coupled components: ' + Json.stringify(available, null, 2));
        else return Objects.readOptFrom(coupled, name).getOrThunk(function () {
          var builder = Objects.readOptFrom(coupleConfig.others(), name).getOrDie(
            new Error('No information found for coupled component: ' + name)
          );
          var spec = builder()(component);
          var built = component.getSystem().build(spec);
          coupled[name] = built;
          return built;
        });
      };

      var readState = Fun.constant({ });

      return BehaviourState({
        readState: readState,
        getOrCreate: getOrCreate
      });
    };

    return {
      init: init
    };
  }
);
