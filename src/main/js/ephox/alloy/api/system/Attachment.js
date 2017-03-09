define(
  'ephox.alloy.api.system.Attachment',

  [
    'ephox.katamari.api.Arr',
    'ephox.katamari.api.Option',
    'ephox.sugar.api.dom.Insert',
    'ephox.sugar.api.dom.Remove',
    'ephox.sugar.api.node.Body',
    'ephox.sugar.api.search.Traverse'
  ],

  function (Arr, Option, Insert, Remove, Body, Traverse) {
    var fireDetaching = function (component) {
      if (Body.inBody(component.element())) {
        component.getSystem().triggerEvent('component.detached', component.element(), { });  
        var children = component.components();
        Arr.each(children, fireDetaching);
      }
    };

    var fireAttaching = function (component) {
      if (Body.inBody(component.element())) {
        component.getSystem().triggerEvent('component.moved', component.element(), { });  
      } else {
        component.getSystem().triggerEvent('component.attached', component.element(), { });
      }

      var children = component.components();
      Arr.each(children, fireAttaching);
    }

    var attach = function (parent, child) {
      attachWith(parent, child, Insert.append);
    };

    var attachWith = function (parent, child, insertion) {
      parent.getSystem().addToWorld(child);
      insertion(parent.element(), child.element());
      if (Body.inBody(parent.element())) fireAttaching(child);
      parent.syncComponents();
    };

    var doDetach = function (component) {
      fireDetaching(component);
      Remove.remove(component);
      component.getSystem().removeFromWorld(component);
    };

    var detach = function (component) {
      var parent = Traverse.parent(component.element()).bind(function (p) {
        return component.getSystem().getByDom(p).fold(Option.none, Option.some);
      });

      doDetach(component);
      parent.each(function (p) {
        p.syncComponents();
      });
    };

    var detachChildren = function (component) {
      // This will not detach the component, but will detach its children and sync at the end.
      var subs = component.components();
      Arr.each(subs, doDetach);
      component.syncComponents();
    };

    var attachSystem = function (element, guiSystem) {
      // TODO: Events for the system element.
      Insert.append(element, guiSystem.element());
      var children = Traverse.children(guiSystem.element());
      Arr.each(children, function (child) {
        guiSystem.getByDom(child).each(fireAttaching);
      });
    };

    var detachSystem = function (guiSystem) {
      var children = Traverse.children(guiSystem.element());
      Arr.each(children, function (child) {
        guiSystem.getByDom(child).each(fireAttaching);
      });
      Remove.remove(guiSystem.element());
    };

    return {
      attach: attach,
      attachWith: attachWith,
      detach: detach,
      detachChildren: detachChildren,

      attachSystem: attachSystem,
      detachSystem: detachSystem
    };
  }
);
