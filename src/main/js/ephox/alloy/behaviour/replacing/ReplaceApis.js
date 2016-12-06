define(
  'ephox.alloy.behaviour.replacing.ReplaceApis',

  [
    'ephox.compass.Arr',
    'ephox.echo.api.AriaFocus',
    'ephox.sugar.api.Compare',
    'ephox.sugar.api.Insert',
    'ephox.sugar.api.Remove'
  ],

  function (Arr, AriaFocus, Compare, Insert, Remove) {
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

    var insert = function (component, replaceInfo, insertion, childSpec) {
      console.log('childSpec', childSpec);
      var child = component.getSystem().build(childSpec);
      component.getSystem().addToWorld(child);
      insertion(component.element(), child.element());
      component.syncComponents();
    };

    var append = function (component, replaceInfo, appendee) {
      insert(component, replaceInfo, Insert.append, appendee);
    };

    var prepend = function (component, replaceInfo, prependee) {
      insert(component, replaceInfo, Insert.prepend, prependee);
    };

    // NOTE: Removee is going to be a component, not a spec.
    var remove = function (component, replaceInfo, removee) {
      var children = contents(component, replaceInfo);
      // TODO: Update for katamari
      var found = Arr.find(children, function (child) {
        return Compare.eq(removee.element(), child.element());
      });

      if (found !== undefined && found !== null) {
        Remove.remove(found.element());
        component.syncComponents();
      }
    };

    // TODO: Rename
    var contents = function (component, replaceInfo) {
      return component.components();
    };

    return {
      append: append,
      prepend: prepend,
      remove: remove,
      set: set,
      contents: contents
    };
  }
);