define(
  'ephox.alloy.behaviour.Redesigning',

  [
    'ephox.alloy.alien.Truncate',
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.compass.Obj',
    'ephox.echo.api.AriaFocus',
    'ephox.numerosity.api.JSON',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Body',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove',
    'global!Error'
  ],

  function (Truncate, Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, Obj, AriaFocus, Json, Fun, Body, Insert, Remove, Error) {
    // FIX: Test
    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var behaviourName = 'redesigning';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.field('index', 'index', FieldPresence.strict(), ValueSchema.anyValue())
      ])
    );

    var insertInPosition = function (parent, placee, components) {
      var eq = Fun.curry(Fun.tripleEquals, placee);
      // Find where it is in the components array
      var index = Arr.findIndex(components, eq);
      if (index > -1) {
        var after = Arr.find(components.slice(index + 1), function (comp) {
          return Body.inBody(comp.element());
        });

        if (after !== undefined && after !== null) {
          Insert.before(after.element(), placee.element());
        } else {
          // Nothing after it is in the DOM ... so let's just append to its parent.
          Insert.append(parent, placee.element());
        }
      } else {
        // FIX: Better error behaviour
        console.error('Could not find in component list', Truncate.getHtml(placee.element()));
      }
    };

    var redesign = function (component, redesignInfo, plan) {
      // On FF, the focus will be lost when we move elements around the DOM, so we need to preserve it.
      AriaFocus.preserve(function () {
         // Now, the data is in 'exclude', 'include' format. For 'exclude', we need
        // to just remove it. That should be pretty easy, so let's start with that.
        Obj.each(plan, function (operation, compName) {
          var current = redesignInfo.index()[compName];
          

          if (current === undefined) 
            throw new Error('I have no idea what "' + compName + '" is in: ' + Json.stringify(plan, false, 2));

          if (operation === 'exclude') Remove.remove(current.element());
          else if (operation === 'include' && !Body.inBody(current.element())) {
            // Find the first thing that is after this component in the component array and insert before it.
            insertInPosition(component.element(), current, component.components());
          }
        });
      }, component.element());
    };

    var apis = function (info) {
      return {
        redesign: Behaviour.tryActionOpt(behaviourName, info, 'redesign', redesign)
      };
    };

    return Behaviour.contract({
      name: Fun.constant(behaviourName),
      exhibit: exhibit,
      handlers: Fun.constant({ }),
      apis: apis,
      schema: Fun.constant(schema)
    });
  }
);