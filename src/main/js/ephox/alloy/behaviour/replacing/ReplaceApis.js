define(
  'ephox.alloy.behaviour.replacing.ReplaceApis',

  [
    'ephox.alloy.alien.AriaFocus',
    'ephox.alloy.api.system.Attachment',
    'ephox.katamari.api.Arr',
    'ephox.sugar.api.dom.Compare',
    'ephox.sugar.api.dom.Insert'
  ],

  function (AriaFocus, Attachment, Arr, Compare, Insert) {
    var set = function (component, replaceInfo, data) {
      Attachment.detachChildren(component);

      // NOTE: we may want to create a behaviour which allows you to switch
      // between predefined layouts, which would make a noop detection easier.
      // Until then, we'll just use AriaFocus like redesigning does.
      AriaFocus.preserve(function () {
        var children = Arr.map(data, component.getSystem().build);
        
        Arr.each(children, function (l) {
          Attachment.attach(component, l);
        });
      }, component.element());
    };

    var insert = function (component, replaceInfo, insertion, childSpec) {
      var child = component.getSystem().build(childSpec);
      Attachment.attachWith(component.element(), child.element(), insertion);
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
      var foundChild = Arr.find(children, function (child) {
        return Compare.eq(removee.element(), child.element());
      });

      foundChild.each(Attachment.detach);
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