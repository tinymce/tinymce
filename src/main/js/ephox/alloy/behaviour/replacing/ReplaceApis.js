define(
  'ephox.alloy.behaviour.replacing.ReplaceApis',

  [
    'ephox.compass.Arr',
    'ephox.echo.api.AriaFocus',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Arr, AriaFocus, Insert, Remove) {
    var clearOld = function (component, replaceInfo) {
      var old = contents(component, replaceInfo);
      Arr.each(old, component.getSystem().removeFromWorld);
    };

    var set = function (component, replaceInfo, data) {
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
      }, component.element());

      component.syncComponents();
    };

    var append = function (component, replaceInfo, appendee) {
      var child = component.getSystem().build(appendee);
      component.getSystem().addToWorld(child);
      Insert.append(component.element(), child.element());
      component.syncComponents();
    };

    // TODO: Rename
    var contents = function (component, replaceInfo) {
      return component.components();
    };

    return {
      append: append,
      set: set,
      contents: contents
    };
  }
);