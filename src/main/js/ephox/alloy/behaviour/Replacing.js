define(
  'ephox.alloy.behaviour.Replacing',

  [
    'ephox.alloy.behaviour.Behaviour',
    'ephox.alloy.dom.DomModification',
    'ephox.boulder.api.FieldPresence',
    'ephox.boulder.api.FieldSchema',
    'ephox.boulder.api.ValueSchema',
    'ephox.compass.Arr',
    'ephox.echo.api.AriaFocus',
    'ephox.peanut.Fun',
    'ephox.scullion.Cell',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Behaviour, DomModification, FieldPresence, FieldSchema, ValueSchema, Arr, AriaFocus, Fun, Cell, Insert, Remove) {
    var behaviourName = 'replacing';

    var schema = FieldSchema.field(
      behaviourName,
      behaviourName,
      FieldPresence.asOption(),
      ValueSchema.objOf([
        FieldSchema.state('state', function () { return Cell({ }); })
      ])
    );

    var clearOld = function (component, replaceInfo) {
      var old = replaceInfo.state().get();
      Arr.each(old, function (child) {
        child.getSystem().removeFromWorld(child);
      });
    };

    var doReplace = function (component, replaceInfo, data) {
      clearOld(component, replaceInfo);

      // NOTE: we may want to create a behaviour which allows you to switch
      // between predefined layouts, which would make a noop detection easier.
      // Until then, we'll just use AriaFocus like redesigning does.
      AriaFocus.preserve(function () {
        var children = Arr.map(data, component.getSystem().build);
        Remove.empty(component.element());
        Arr.each(children, function (l) {
          component.getSystem().addToWorld(l);
          Insert.append(component.element(), l.element());
        });

        replaceInfo.state().set(children);
      }, component.element());
    };

    var doContents = function (component, replaceInfo) {
      return replaceInfo.state().get();
    };

    var exhibit = function (info, base) {
      return DomModification.nu({ });
    };

    var apis = function (info) {
      return {
        replace: Behaviour.tryActionOpt(behaviourName, info, 'replace', doReplace),
        contents: Behaviour.tryActionOpt(behaviourName, info, 'contents', doContents)
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