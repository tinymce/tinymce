define(
  'ephox.alloy.api.focus.FocusManagers',

  [
    'ephox.alloy.api.behaviour.Highlighting',
    'ephox.peanut.Fun',
    'ephox.sugar.api.Focus'
  ],

  function (Highlighting, Fun, Focus) {

    var dom = function () {
      var get = function (component) {
        return Focus.search(component.element());
      };

      var set = function (component, focusee) {
        component.getSystem().triggerFocus(focusee, component.element());
      };

      return {
        get: get,
        set: set
      };
    };

    var highlights = function () {
      var get = function (component) {
        return Highlighting.getHighlighted(component).map(function (item) {
          return item.element();
        });
      };

      var set = function (component, element) {
        component.getSystem().getByDom(element).fold(Fun.noop, function (item) {
          Highlighting.highlight(component, item);
        });          
      };

      return {
        get: get,
        set: set
      };
    };

    return {
      dom: dom,
      highlights: highlights
    };
  }
);